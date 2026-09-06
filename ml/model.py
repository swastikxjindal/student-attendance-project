import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_attendance(records):
    """
    Predict future attendance percentage using
    Linear Regression and real attendance records.
    """

    # ==========================================
    # CHECK RECORDS
    # ==========================================

    if not records:
        return {
            "success": False,
            "message": "No attendance records found"
        }

    # ==========================================
    # CREATE DATAFRAME
    # ==========================================

    df = pd.DataFrame(records)

    if "status" not in df.columns:
        return {
            "success": False,
            "message": "Attendance status not found"
        }

    # Make status lowercase
    df["status"] = (
        df["status"]
        .astype(str)
        .str.lower()
    )

    # ==========================================
    # ONLY PRESENT / ABSENT
    # ==========================================

    df = df[
        df["status"].isin(["present", "absent"])
    ].copy()

    if len(df) < 3:
        return {
            "success": False,
            "message":
                "At least 3 present/absent records are required for ML prediction",
            "records_used": len(df)
        }

    # ==========================================
    # CONVERT STATUS TO 0 / 1
    # ==========================================

    df["present_value"] = (
        df["status"] == "present"
    ).astype(int)

    # ==========================================
    # CREATE HISTORICAL DATA
    # ==========================================

    historical_data = []

    present_count = 0
    conducted_count = 0

    for index, row in df.iterrows():

        # Add current lecture
        conducted_count += 1

        if row["present_value"] == 1:
            present_count += 1

        # Need previous records to calculate
        # historical attendance
        if conducted_count < 2:
            continue

        current_attendance = (
            present_count /
            conducted_count
        ) * 100

        # Recent 5 lectures up to this point
        start_index = max(
            0,
            len(historical_data) - 5
        )

        recent_records = df.iloc[
            start_index:index + 1
        ]

        recent_attendance = (
            recent_records["present_value"]
            .mean()
            * 100
        )

        historical_data.append({

            "lectures_conducted":
                conducted_count,

            "lectures_attended":
                present_count,

            "recent_attendance":
                recent_attendance,

            "attendance_percentage":
                current_attendance
        })

    # ==========================================
    # CHECK TRAINING DATA
    # ==========================================

    if len(historical_data) < 2:
        return {
            "success": False,
            "message":
                "Not enough historical data for Linear Regression",
            "records_used": len(df)
        }

    train_df = pd.DataFrame(
        historical_data
    )

    # ==========================================
    # FEATURES
    # ==========================================

    X = train_df[
        [
            "lectures_conducted",
            "lectures_attended",
            "recent_attendance"
        ]
    ]

    # ==========================================
    # TARGET
    # ==========================================

    y = train_df[
        "attendance_percentage"
    ]

    # ==========================================
    # TRAIN LINEAR REGRESSION
    # ==========================================

    model = LinearRegression()

    model.fit(X, y)

    # ==========================================
    # CURRENT ATTENDANCE
    # ==========================================

    total_lectures = len(df)

    total_present = int(
        df["present_value"].sum()
    )

    current_percentage = (
        total_present /
        total_lectures
    ) * 100

    # ==========================================
    # RECENT ATTENDANCE
    # ==========================================

    recent_df = df.tail(5)

    recent_attendance = (
        recent_df["present_value"]
        .mean()
        * 100
    )

    # ==========================================
    # FUTURE LECTURES
    # ==========================================

    future_lectures = 5

    future_conducted = (
        total_lectures +
        future_lectures
    )

    # Estimate future attendance
    # using recent attendance pattern

    expected_future_present = (
        future_lectures *
        recent_attendance /
        100
    )

    future_attended_estimate = (
        total_present +
        expected_future_present
    )

    # ==========================================
    # INPUT FOR LINEAR REGRESSION
    # ==========================================

    prediction_input = pd.DataFrame([
        {
            "lectures_conducted":
                future_conducted,

            "lectures_attended":
                future_attended_estimate,

            "recent_attendance":
                recent_attendance
        }
    ])

    # ==========================================
    # PREDICTION
    # ==========================================

    prediction = model.predict(
        prediction_input
    )[0]

    # Keep between 0 and 100
    prediction = max(
        0,
        min(100, prediction)
    )

    # ==========================================
    # RETURN RESULT
    # ==========================================

    return {

        "success": True,

        "current_attendance":
            round(
                current_percentage,
                2
            ),

        "predicted_attendance":
            round(
                float(prediction),
                2
            ),

        "lectures_conducted":
            total_lectures,

        "lectures_attended":
            total_present,

        "recent_attendance":
            round(
                recent_attendance,
                2
            ),

        "future_lectures":
            future_lectures,

        "records_used":
            len(df),

        "model":
            "Linear Regression"
    }
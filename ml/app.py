from flask import Flask, request, jsonify
from flask_cors import CORS

from model import predict_attendance


app = Flask(__name__)

CORS(app)


# ==========================================
# HOME / HEALTH CHECK
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Attendance ML API is running"
    })


# ==========================================
# LINEAR REGRESSION PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get JSON data sent by Node.js
        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No data received"
            }), 400


        # Get REAL attendance records
        records = data.get(
            "records",
            []
        )


        # ======================================
        # TERMINAL INFORMATION
        # ======================================

        print("\n")
        print("==========================================")
        print("       ATTENDANCE ML PREDICTION")
        print("==========================================")

        print(
            f"Records received from MySQL: {len(records)}"
        )


        # ======================================
        # RUN LINEAR REGRESSION MODEL
        # ======================================

        result = predict_attendance(
            records
        )


        # ======================================
        # PRINT RESULT IN TERMINAL
        # ======================================

        print("------------------------------------------")

        if result.get("success"):

            print(
                f"Current Attendance    : "
                f"{result.get('current_attendance')}%"
            )

            print(
                f"Predicted Attendance  : "
                f"{result.get('predicted_attendance')}%"
            )

            print(
                f"Lectures Conducted    : "
                f"{result.get('lectures_conducted')}"
            )

            print(
                f"Lectures Attended     : "
                f"{result.get('lectures_attended')}"
            )

            print(
                f"Recent Attendance     : "
                f"{result.get('recent_attendance')}%"
            )

            print(
                f"Future Lectures       : "
                f"{result.get('future_lectures')}"
            )

            print(
                f"Records Used          : "
                f"{result.get('records_used')}"
            )

            print(
                f"ML Model              : "
                f"{result.get('model')}"
            )

        else:

            print(
                "Prediction failed:"
            )

            print(
                f"Reason: {result.get('message')}"
            )

        print("------------------------------------------")
        print("Prediction completed")
        print("==========================================")
        print("\n")


        # ======================================
        # SEND RESULT BACK TO NODE.JS
        # ======================================

        return jsonify(result)


    except Exception as error:

        print("\n")
        print("==========================================")
        print("              ML ERROR")
        print("==========================================")

        print(
            f"Error: {error}"
        )

        print("==========================================")
        print("\n")


        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# ==========================================
# START FLASK SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=True
    )

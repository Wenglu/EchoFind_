from flask import Flask, jsonify


app = Flask(__name__)

# Przykładowe dane ML — np. wynik predykcji klasyfikatora
sample_prediction = {
    "input": [5.1, 3.5, 1.4, 0.2],
    "predicted_class": "setosa",
    "confidence": 0.98
}

@app.route('/api/predict')
def predict():
    return jsonify(sample_prediction)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

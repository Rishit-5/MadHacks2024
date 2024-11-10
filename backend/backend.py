# app.py

from flask import Flask, request, jsonify
from transaction_minimizer import TransactionMinimizer
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/minimize_transactions', methods=['POST'])
def minimize_transactions():
    """
    Endpoint to calculate minimal transactions required to settle debts.
    Expects a JSON payload with 'num_vertices' and 'edges'.
    """
    data = request.get_json()

    # Check if JSON payload is present
    if not data:
        logger.error("No input data provided.")
        return jsonify({"error": "No input data provided."}), 400

    num_vertices = data.get('num_vertices')
    edges = data.get('edges')

    # Validate presence of required fields
    if num_vertices is None or edges is None:
        logger.error("Missing 'num_vertices' or 'edges' in input data.")
        return jsonify({"error": "Missing 'num_vertices' or 'edges' in input data."}), 400

    # Validate data types
    if not isinstance(num_vertices, int) or num_vertices <= 0:
        logger.error("'num_vertices' must be a positive integer.")
        return jsonify({"error": "'num_vertices' must be a positive integer."}), 400

    if not isinstance(edges, list):
        logger.error("'edges' must be a list of edge objects.")
        return jsonify({"error": "'edges' must be a list of edge objects."}), 400

    # Convert edge dictionaries to tuples and validate each edge
    edge_tuples = []
    for idx, edge in enumerate(edges):
        if not isinstance(edge, dict):
            logger.error(f"Edge at index {idx} is not a valid object.")
            return jsonify({"error": f"Edge at index {idx} is not a valid object."}), 400

        u = edge.get('from')
        v = edge.get('to')
        capacity = edge.get('capacity')

        if u is None or v is None or capacity is None:
            logger.error(f"Edge at index {idx} is missing 'from', 'to', or 'capacity'.")
            return jsonify({"error": f"Edge at index {idx} is missing 'from', 'to', or 'capacity'."}), 400

        # Validate individual edge data types
        if not isinstance(u, int) or not isinstance(v, int) or not isinstance(capacity, int):
            logger.error(f"'from', 'to', and 'capacity' in edge at index {idx} must be integers.")
            return jsonify({"error": f"'from', 'to', and 'capacity' in edge at index {idx} must be integers."}), 400

        # Optionally, validate that 'from' and 'to' are within the range of vertices
        if not (0 <= u < num_vertices) or not (0 <= v < num_vertices):
            logger.error(f"'from' and 'to' in edge at index {idx} must be between 0 and {num_vertices - 1}.")
            return jsonify({"error": f"'from' and 'to' in edge at index {idx} must be between 0 and {num_vertices - 1}."}), 400

        edge_tuples.append((u, v, capacity))

    try:
        # Initialize the TransactionMinimizer with converted edge tuples
        minimizer = TransactionMinimizer(num_vertices, edge_tuples)

        # Calculate minimal transactions
        transactions = minimizer.minimize_transactions()

        logger.info("Successfully calculated minimal transactions.")
        return jsonify({"transactions": transactions}), 200

    except ValueError as ve:
        logger.error(f"ValueError: {ve}")
        return jsonify({"error": str(ve)}), 400

    except IndexError as ie:
        logger.error(f"IndexError: {ie}")
        return jsonify({"error": str(ie)}), 400

    except Exception as e:
        logger.exception("An unexpected error occurred.")
        return jsonify({"error": "An unexpected error occurred."}), 500

if __name__ == "__main__":
    app.run(debug=True)
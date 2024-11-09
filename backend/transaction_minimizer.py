# transaction_minimizer.py

from typing import List, Tuple


class DirectedGraph:
    """
    DirectedGraph represents a directed graph using an adjacency matrix.
    It allows adding edges and calculating net balances for each vertex.
    """

    def __init__(self, vertices: int):
        """
        Initializes a DirectedGraph with a specified number of vertices.

        :param vertices: Number of vertices in the graph.
        """
        self.V = vertices
        self.graph = [[0] * vertices for _ in range(vertices)]

    def add_edge(self, u: int, v: int, capacity: int):
        """
        Adds an edge from vertex u to vertex v with the given capacity.

        :param u: Source vertex index.
        :param v: Destination vertex index.
        :param capacity: Capacity of the edge.
        :raises ValueError: If capacity is negative.
        :raises IndexError: If vertex indices are out of bounds.
        """
        if not (0 <= u < self.V) or not (0 <= v < self.V):
            raise IndexError(f"Invalid vertex indices. Please enter values between 0 and {self.V - 1}.")
        if capacity < 0:
            raise ValueError("Capacity must be a non-negative integer.")
        self.graph[u][v] += capacity

    def calculate_net_balances(self) -> List[int]:
        """
        Calculates the net balance for each vertex.

        :return: A list where each element represents the net balance of a vertex.
                 Positive value indicates the vertex should receive money,
                 negative value indicates the vertex should pay money.
        """
        net_balance = [0] * self.V
        for u in range(self.V):
            for v in range(self.V):
                net_balance[u] -= self.graph[u][v]  # Outflow (u pays v)
                net_balance[v] += self.graph[u][v]  # Inflow (v receives from u)
        return net_balance


class TransactionMinimizer:
    """
    TransactionMinimizer calculates the minimal set of transactions required to settle debts
    based on the net balances of a DirectedGraph.
    """

    def __init__(self, vertices: int, edges: List[Tuple[int, int, int]]):
        """
        Initializes the TransactionMinimizer with the number of vertices and list of edges.

        :param vertices: Number of vertices in the graph.
        :param edges: List of tuples representing edges in the format (from, to, capacity).
        """
        self.graph = DirectedGraph(vertices)
        for edge in edges:
            u, v, capacity = edge
            self.graph.add_edge(u, v, capacity)

    def minimize_transactions(self) -> List[Tuple[int, int, int]]:
        """
        Determines the minimal set of transactions to settle all debts.

        :return: A list of transactions where each transaction is represented as a tuple:
                 (payer_vertex_index, receiver_vertex_index, transaction_amount)
        """
        net_balance = self.graph.calculate_net_balances()
        receivers: List[Tuple[int, int]] = []  # Nodes that need to receive money (net_balance > 0)
        payers: List[Tuple[int, int]] = []     # Nodes that need to pay money (net_balance < 0)

        # Separate nodes into receivers and payers
        for i in range(self.graph.V):
            if net_balance[i] > 0:
                receivers.append((i, net_balance[i]))
            elif net_balance[i] < 0:
                payers.append((i, -net_balance[i]))

        # Sort receivers and payers by amount descending
        receivers.sort(key=lambda x: x[1], reverse=True)   # Largest to smallest
        payers.sort(key=lambda x: x[1], reverse=True)      # Largest to smallest

        i, j = 0, 0
        transactions: List[Tuple[int, int, int]] = []

        while i < len(receivers) and j < len(payers):
            receiver, receive_amount = receivers[i]
            payer, pay_amount = payers[j]

            amount = min(receive_amount, pay_amount)
            transactions.append((payer, receiver, amount))  # Payer pays the receiver

            # Update the balances
            receivers[i] = (receiver, receive_amount - amount)
            payers[j] = (payer, pay_amount - amount)

            if receivers[i][1] == 0:
                i += 1
            if payers[j][1] == 0:
                j += 1

        return transactions

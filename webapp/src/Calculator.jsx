import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { useParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';

export function encodeEmail(email){
    return email.replaceAll('.', ',').replaceAll('#', ',').replaceAll('$', ',').replaceAll('[', ',').replaceAll(']', ',');
}

const CalculationResults = () => {
    const { groupName } = useParams();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    // Fetch transactions data
    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        const transactionsRef = ref(db, `Groups/${groupName}/Requests`);
        onValue(transactionsRef, (snapshot) => {
            const transactionsData = snapshot.val();
            alert(transactionsData);
            if (transactionsData) {
                const loadedTransactions = Object.entries(transactionsData).map(([id, transaction]) => ({
                    id,
                    ...transaction,
                }));
                setTransactions(loadedTransactions);
            } else {
                setTransactions([]);
            }
        });
    }, [groupName]);

    // Calculate transactions after fetching data
    useEffect(() => {
        const calculateTransactions = async () => {
            try {
                const db = getDatabase();
                const groupRef = ref(db, `Groups/${groupName}`);
                const groupSnapshot = await get(groupRef);

                if (!groupSnapshot.exists()) {
                    throw new Error('Group data not found');
                }

                const groupData = groupSnapshot.val();
                const ownerEmail = groupData.Owner;
                const authenticatedUsers = groupData.AuthenticatedUsers || [];

                const guests = groupData.Guests
                    ? Object.values(groupData.Guests).reduce((acc, guest) => {
                          acc[guest.Email] = guest.Name;
                          return acc;
                      }, {})
                    : {};

                const emailToNameMap = {};
                for (const email of [ownerEmail, ...authenticatedUsers]) {
                    const userRef = ref(db, `Users/${encodeEmail(email)}`);
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        emailToNameMap[email] = userSnapshot.val().name || email;
                    }
                }

                const nameMap = { ...emailToNameMap, ...guests };

                const transactionsWithNames = transactions.map((transaction) => ({
                    ...transaction,
                    creator: nameMap[transaction.creator] || transaction.creator,
                    members: transaction.members.map((member) => nameMap[member] || member),
                }));

                const edges = transactionsWithNames.map((transaction) => [
                    ...transaction.members,
                    transaction.creator,
                    transaction.amount,
                ]);

                const uniqueNames = Array.from(new Set(Object.values(nameMap)));

                const response = await fetch('https://us-central1-splitech-441301.cloudfunctions.net/splitech', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ names: uniqueNames, edges }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch calculation results');
                }

                const data = await response.json();
                setResults(data.transactions || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (transactions.length > 0) {
            calculateTransactions();
        }
    }, [groupName, transactions]);

    // if (loading) {
    //     return <StyledLoader>Loading...</StyledLoader>;
    // }

    // if (error) {
    //     return <ErrorText>{error}</ErrorText>;
    // }

    return (
        <Container>
            <Header>Calculation Results</Header>
            {groupName}
            <ResultsContainer>
                {results.map((item, index) => (
                    <ResultText key={index}>
                        {item[0]} owes {item[1]}: ${item[2].toFixed(2)}
                    </ResultText>
                ))}
            </ResultsContainer>
        </Container>
    );
};

export default CalculationResults;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #FFFFFF;
  min-height: 100vh;
`;

const Header = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #2D9CDB;
  margin-bottom: 20px;
  text-align: center;
`;

const StyledLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
  color: #2D9CDB;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 16px;
  text-align: center;
  margin-top: 20px;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
`;

const ResultText = styled.div`
  font-size: 18px;
  color: #333;
  padding: 10px;
  background-color: #F3F4F6;
  border-radius: 8px;
  margin: 5px 0;
  text-align: center;
`;

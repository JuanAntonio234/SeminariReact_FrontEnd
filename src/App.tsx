import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { User } from './types';
import Form from './components/Form';
import UsersList from './components/UsersList';
import { fetchUsers, LogIn } from './services/usersService';
import Login from './components/Login';
import EditUserForm from './components/UsersEdit/formReducer';

interface AppState {
    currentUser: User | null;
    users: User[];
    newUsersNumber: number;
    isLoggedIn: boolean;
}

interface UIState {
    isDarkMode: boolean;
    showNotification: boolean;
    newUserName: string;
}

function App() {
    const [users, setUsers] = useState<AppState['users']>([]);
    const [newUsersNumber, setNewUsersNumber] = useState<AppState['newUsersNumber']>(0);
    const [isLoggedIn, setIsLoggedIn] = useState<AppState['isLoggedIn']>(false);
    const [currentUser, setCurrentUser] = useState<AppState['currentUser']>(null);
    const[viewingAllUsers, setViewingAllUsers] = useState<boolean>(false);;

    const [uiState, setUiState] = useState<UIState>({
        isDarkMode: false,
        showNotification: false,
        newUserName: '',
    });

    const divRef = useRef<HTMLDivElement>(null); // Mantenemos el useRef como ejemplo

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const fetchedUsers = await fetchUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error loading users:', error);
                setUsers([]);
            }
        };
        if (isLoggedIn) {
            loadUsers();
        }
    }, [newUsersNumber, isLoggedIn]);

    useEffect(() => {
        if (uiState.showNotification) {
            const timer = setTimeout(() => {
                setUiState((prev) => ({
                    ...prev,
                    showNotification: false,
                }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [uiState.showNotification]);

    const handleNewUser = (newUser: User): void => {
        setNewUsersNumber((n) => n + 1);
        setUiState((prev) => ({
            ...prev,
            newUserName: newUser.name,
            showNotification: true,
        }));
    };

    const toggleDarkMode = () => {
        setUiState((prev) => {
            const newMode = !prev.isDarkMode;

            // Ejemplo de uso de useRef para cambiar estilos directamente
            if (divRef.current) {
                divRef.current.style.backgroundColor = newMode ? '#333333' : '#ffffff';
                divRef.current.style.color = newMode ? '#ffffff' : '#000000';
            }

            return { ...prev, isDarkMode: newMode };
        });
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            const user = await LogIn(email, password);
            console.log('User logged in:', user);
            setCurrentUser(user);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    const handleEditUser = async(updatedUser: User) => {
        try {
            const refreshedUsers = await fetchUsers();
            setUsers(refreshedUsers);
             
            setUiState((prev) => ({
                ...prev,
                newUserName: updatedUser.name,
                showNotification: true,
            }));
            setCurrentUser(null);
            setViewingAllUsers(true);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };
        

    const handleCancelEditUser=()=>{ 
        setCurrentUser(null);
        setViewingAllUsers(true);
    };

    const handleSelectUser=(user:User)=>{
        setCurrentUser(user);
        setViewingAllUsers(false);
    };

    return (
        <div className="App" ref={divRef}>
            {/* Notification Popup */}
            {uiState.showNotification && (
                <div className={`notification ${uiState.isDarkMode ? 'dark' : 'light'}`}>
                    User <strong>{uiState.newUserName}</strong> has been created successfully!
                </div>
            )}

            <button onClick={toggleDarkMode} className="toggleButton">
                {uiState.isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <div className="content">
                {!isLoggedIn ? (
                    <Login
                        onLogin={({ email, password }) => handleLogin(email, password)}
                    />
                ) : (
                    <>
                        <h2>Bienvenido, {currentUser?.name}!</h2>
                       {/* Botón para ir a la lista de usuarios */}
                       {!viewingAllUsers && (
                            <button onClick={() => setViewingAllUsers(true)}>Ver todos los usuarios</button>
                        )}
                        
                        {currentUser && !viewingAllUsers ? (
                            <EditUserForm 
                                user={currentUser} 
                                onEditUser={handleEditUser}
                                onCancel={handleCancelEditUser}
                            />
                        ) : (
                            <>
                                {/* Mostrar lista de usuarios */}
                                <UsersList 
                                    users={users} 
                                    onEdit={handleSelectUser} 
                                />
                                <p>New users: {newUsersNumber}</p>
                                <Form onNewUser={handleNewUser} />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


export default App;

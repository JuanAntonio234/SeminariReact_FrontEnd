import React,{useEffect, useReducer} from "react";
import styles from './UsersEdit.module.css';
import { updateUser } from "../../services/usersService";
import { User } from "../../types";

interface FormProps{
    user: User;
    onEditUser: (updatedUser:User)=>void;
    onCancel:()=>void;
}
const INITIAL_STATE: User = {
    _id:'',
    name: '',
    age: 0,
    email: '',
    password: '',
    phone: 0
};

type FormReducerAction =
    | { 
        type: "change_value"; 
        payload: { 
            inputName: keyof User; 
            inputValue: string | number 
        } 
    }
    | { type: "clear" }
    | { type: "set_user";payload: User };
    
const formReducer = (state:User, action: FormReducerAction):User=>{
    switch(action.type){
        case "change_value":
        return{
            ...state,
            [action.payload.inputName]:action.payload.inputValue
        };
        case "set_user":
        return {...action.payload};
        case "clear":
        return INITIAL_STATE;
        default:
            return state;
    }
};

const EditUserForm=({user,onEditUser,onCancel}:FormProps)=>{
    const [inputValues,dispatch]=useReducer(formReducer,INITIAL_STATE);

    useEffect(() => {
        if (user) {
            dispatch({ type: "set_user", payload: user });
        }
    }, [user]);

    const handleSubmit=async(evt:React.FormEvent<HTMLFormElement>)=>{
        evt.preventDefault();
        if (!inputValues.name && inputValues.age && !inputValues.email && !inputValues.password) {
            alert('Please fill in the form fields.');
            return;
        }
        try{
            const updatedUser=await updateUser(inputValues);
            onEditUser(updatedUser);
            dispatch({type:"clear"});
        }catch(error){
            console.error('Error updating user',error);
        }
    };

    const handleChange=(evt:React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=evt.target;
        dispatch({
            type:"change_value",
            payload:{
                inputName:name as keyof User,
                inputValue: name === 'age' || name === 'phone' ? Number(value) : value
            }
        });
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>Name</label>
                    <input type='text'
                        name="name" 
                        id="name" 
                        value={inputValues.name} 
                        onChange={handleChange} 
                        placeholder="Enter your name"
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="age" className={styles.label}>Age</label>
                    <input
                        onChange={handleChange}
                        value={inputValues.age || ''}
                        type='number'
                        name="age"
                        id="age"
                        placeholder="Enter your age"
                        className={styles.input}
                        min="0"
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input
                        onChange={handleChange}
                        value={inputValues.email}
                        type='email'
                        name="email"
                        id="email"
                        placeholder="Enter your email"
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <input
                        onChange={handleChange}
                        value={inputValues.password}
                        type='password'
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <button 
                        type="button" 
                        onClick={() => {dispatch({ type: "clear" });
                        onCancel();
                    }} 
                        className={styles.button}
                    >
                        Cancel
                    </button>
                    <button type="submit" className={styles.button}>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};
export default EditUserForm;
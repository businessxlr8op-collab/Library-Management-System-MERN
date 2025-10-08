import React, { useContext, useState } from 'react'
import './Signin.css'
import axios from 'axios'
import { AuthContext } from '../Context/AuthContext.js'
import Switch from '@material-ui/core/Switch';

function Signin() {
    const [isStudent, setIsStudent] = useState(true)
    const [admissionId, setAdmissionId] = useState()
    const [employeeId,setEmployeeId] = useState()
    const [password, setPassword] = useState()
    const [error, setError] = useState("")
    const { dispatch } = useContext(AuthContext)

    const loginCall = async (userCredential, dispatch) => {
        dispatch({ type: "LOGIN_START" });
        try {
            // use relative path so CRA proxy forwards to backend
            const res = await axios.post('/api/auth/signin', userCredential);
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
        }
        catch (err) {
            dispatch({ type: "LOGIN_FAILURE", payload: err })
            // try to show backend message when present
            const msg = err && err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Wrong Password Or Username';
            setError(msg);
        }
    }

    const handleForm = (e) => {
        e.preventDefault()
        // backend expects `student_id` (or email). Map both admissionId/employeeId to student_id
        const id = isStudent ? admissionId : employeeId;
        loginCall({ student_id: id, password }, dispatch)
    }

    return (
        <div className='signin-container'>
            <div className="signin-card">
                <form onSubmit={handleForm}>
                    <h2 className="signin-title"> Log in</h2>
                    <p className="line"></p>
                    <div className="persontype-question">
                        <p>Are you a Staff member ?</p>
                        <Switch
                            onChange={() => setIsStudent(!isStudent)}
                            color="primary"
                        />
                    </div>
                    <div className="error-message"><p>{error}</p></div>
                    <div className="signin-fields">
                        <label htmlFor={isStudent?"admissionId":"employeeId"}> <b>{isStudent?"Admission ID":"Employee ID"}</b></label>
                        <input className='signin-textbox' type="text" placeholder={isStudent?"Enter Admission ID":"Enter Employee ID"} name={isStudent?"admissionId":"employeeId"} required onChange={(e) => { isStudent?setAdmissionId(e.target.value):setEmployeeId(e.target.value) }}/>
                        <label htmlFor="password"><b>Password</b></label>
                        <input className='signin-textbox' type="password" minLength='6' placeholder="Enter Password" name="psw" required onChange={(e) => { setPassword(e.target.value) }} />
                        </div>
                    <button className="signin-button">Log In</button>
                    <a className="forget-pass" href="#home">Forgot password?</a>
                </form>
                <div className='signup-option'>
                    <p className="signup-question">Don't have an account? Contact Librarian</p>
                </div>
            </div>
        </div>
    )
}

export default Signin
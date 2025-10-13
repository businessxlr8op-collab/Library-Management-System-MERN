import React, { useContext, useEffect, useState } from 'react'
import "../AdminDashboard.css"
import axios from "axios"
import { AuthContext } from '../../../../Context/AuthContext'
import { Dropdown } from 'semantic-ui-react'

function AddBook() {

    const API_URL = process.env.REACT_APP_API_URL
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useContext(AuthContext)

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [available, setAvailable] = useState(1);
    const [category, setCategory] = useState("");
    const [almirahNo, setAlmirahNo] = useState("");
    const [recentAddedBooks, setRecentAddedBooks] = useState([]);


    /* Fetch all the Categories */
    // No need for categories fetch, use category and almirahNo directly

    /* Adding book function */
    const addBook = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const BookData = {
            title,
            author,
            available: Number(available),
            category,
            almirahNo,
            isAdmin: user.isAdmin
        };
        try {
            const response = await axios.post(API_URL + "api/books", BookData);
            if (recentAddedBooks.length >= 5) {
                recentAddedBooks.splice(-1);
            }
            setRecentAddedBooks([response.data, ...recentAddedBooks]);
            setTitle("");
            setAuthor("");
            setAvailable(1);
            setCategory("");
            setAlmirahNo("");
            alert("Book Added Successfully 🎉");
        } catch (err) {
            console.log(err);
        }
        setIsLoading(false);
    };


    useEffect(() => {
        const getallBooks = async () => {
            const response = await axios.get(API_URL + "api/books?all=true");
            setRecentAddedBooks(response.data.data.slice(0, 5));
        };
        getallBooks();
    }, [API_URL]);


    return (
        <div>
            <p className="dashboard-option-title">Add a Book</p>
            <div className="dashboard-title-line"></div>
            <form className='addbook-form' onSubmit={addBook}>
                <label className="addbook-form-label" htmlFor="title">Book Title<span className="required-field">*</span></label><br />
                <input className="addbook-form-input" type="text" name="title" value={title} onChange={(e) => { setTitle(e.target.value) }} required></input><br />
                <label className="addbook-form-label" htmlFor="author">Author Name<span className="required-field">*</span></label><br />
                <input className="addbook-form-input" type="text" name="author" value={author} onChange={(e) => { setAuthor(e.target.value) }} required></input><br />
                <label className="addbook-form-label" htmlFor="available">No. of Copies Available<span className="required-field">*</span></label><br />
                <input className="addbook-form-input" type="number" name="available" value={available} onChange={(e) => { setAvailable(e.target.value) }} required></input><br />
                <label className="addbook-form-label" htmlFor="category">Category<span className="required-field">*</span></label><br />
                <input className="addbook-form-input" type="text" name="category" value={category} onChange={(e) => { setCategory(e.target.value) }} required></input><br />
                <label className="addbook-form-label" htmlFor="almirahNo">Almirah No<span className="required-field">*</span></label><br />
                <input className="addbook-form-input" type="text" name="almirahNo" value={almirahNo} onChange={(e) => { setAlmirahNo(e.target.value) }} required></input><br />
                <input className="addbook-submit" type="submit" value="SUBMIT" disabled={isLoading}></input>
            </form>
            <div>
                <p className="dashboard-option-title">Recently Added Books</p>
                <div className="dashboard-title-line"></div>
                <table className='admindashboard-table'>
                    <tr>
                        <th>S.No</th>
                        <th>Book Name</th>
                        <th>Added Date</th>
                    </tr>
                    {
                        recentAddedBooks.map((book, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{book.bookName}</td>
                                    <td>{book.createdAt.substring(0, 10)}</td>
                                </tr>
                            )
                        })
                    }
                </table>
            </div>
        </div>
    )
}

export default AddBook
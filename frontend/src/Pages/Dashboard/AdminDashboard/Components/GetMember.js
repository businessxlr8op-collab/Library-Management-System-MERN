import React, { useEffect, useState } from 'react'
import "../AdminDashboard.css"
import axios from "axios"
import '../../MemberDashboard/MemberDashboard.css'
import moment from "moment"
import './GetMember.css'

function GetMember() {

    // use relative API paths so CRA proxy forwards correctly
    const API = '/api';

    const [allMembersOptions, setAllMembersOptions] = useState(null)
    const [memberId, setMemberId] = useState(null)
    const [memberDetails, setMemberDetails] = useState(null)
    const [studentsByClass, setStudentsByClass] = useState({})
    const [selectedClass, setSelectedClass] = useState('9')

    // ensure classes 1..12 plus Unclassified exist in UI
    const STANDARD_CLASSES = ['Unclassified', '1','2','3','4','5','6','7','8','9','10','11','12']

    //Fetch Members
    useEffect(() => {
        const getMembers = async () => {
            try {
                const response = await axios.get(API + '/students/allstudents');
                const students = response.data || [];
                setAllMembersOptions(students.map((member) => (
                    { value: `${member?._id}`, text: `${member?.userFullName || member?.name || 'Member'} [${member?.admissionId || member?.employeeId || ''}]` }
                )));
                // Group students by their class (class field may be "class" or "grade_level")
                const groups = {};
                for (const s of students) {
                    const cls = (s.class || s.grade_level || s.class_level || 'Unclassified') || 'Unclassified';
                    const key = String(cls).trim() || 'Unclassified';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(s);
                }
                for (const c of STANDARD_CLASSES) if (!groups[c]) groups[c] = [];
                setStudentsByClass(groups);
            } catch (err) {
                console.log(err);
            }
        };
        getMembers();
    }, [STANDARD_CLASSES]);

    useEffect(() => {
        const getMemberDetails = async () => {
            if (memberId !== null) {
                try {
                    const response = await axios.get(API + '/students/' + memberId);
                    setMemberDetails(response.data);
                } catch (err) {
                    console.log("Error in fetching the member details", err);
                }
            }
        };
        getMemberDetails();
    }, [memberId]);


    return (
        <div>
            <div className='semanticdropdown getmember-dropdown'>
                    <div className='getmember-grid'>
                        <aside className='class-column'>
                            <h4>Classes</h4>
                            <ul>
                                {STANDARD_CLASSES.map((c) => (
                                    <li key={c} className={selectedClass === String(c) ? 'active' : ''} onClick={() => setSelectedClass(String(c))}>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <section className='students-column'>
                            <div className='students-header'>
                                <h4>Students — Class {selectedClass}</h4>
                                <div className='students-count'>{(studentsByClass[selectedClass] || []).length} students</div>
                            </div>
                            <div className='student-list'>
                                {(studentsByClass[selectedClass] || []).length === 0 ? (
                                    <div className='empty-msg'>No students in this class.</div>
                                ) : (
                                    <ul>
                                        {(studentsByClass[selectedClass] || []).map((s) => (
                                            <li key={s._id} onClick={() => setMemberId(s._id)} className={memberId === s._id ? 'selected' : ''}>
                                                <div className='student-name'>{s.name}</div>
                                                <div className='student-meta'>{s.student_id || s.admissionId || ''} • {s.class || s.grade_level || 'Unclassified'}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    </div>
            </div>
            <div style={memberId === null ? { display: "none" } : {}}>
                <div className="member-profile-content" id="profile@member" style={memberId === null ? { display: "none" } : {}}>
                    <div className="user-details-topbar">
                        <img className="user-profileimage" src="./assets/images/Profile.png" alt=""></img>
                        <div className="user-info">
                            <p className="user-name">{memberDetails?.name || memberDetails?.userFullName}</p>
                            <p className="user-id">{memberDetails?.student_id || memberDetails?.admissionId || memberDetails?.employeeId}</p>
                            <p className="user-email">{memberDetails?.email}</p>
                            <p className="user-phone">{memberDetails?.phone || memberDetails?.mobileNumber}</p>
                        </div>
                    </div>
                    <div className="user-details-specific">
                        <div className="specific-left">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ display: "flex", flex: "0.5", flexDirection: "column" }}>
                                    <span style={{ fontSize: "18px" }}>
                                        <b>Age</b>
                                    </span>
                                    <span style={{ fontSize: "16px" }}>
                                    {memberDetails?.age}
                                    </span>
                                </p>
                                <p style={{ display: "flex", flex: "0.5", flexDirection: "column" }}>
                                    <span style={{ fontSize: "18px" }}>
                                        <b>Gender</b>
                                    </span>
                                    <span style={{ fontSize: "16px" }}>
                                    {memberDetails?.gender}
                                    </span>
                                </p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                                <p style={{ display: "flex", flex: "0.5", flexDirection: "column" }}>
                                    <span style={{ fontSize: "18px" }}>
                                        <b>DOB</b>
                                    </span>
                                    <span style={{ fontSize: "16px" }}>
                                        {memberDetails?.dob}
                                    </span>
                                </p>
                                <p style={{ display: "flex", flex: "0.5", flexDirection: "column" }}>
                                    <span style={{ fontSize: "18px" }}>
                                        <b>Address</b>
                                    </span>
                                    <span style={{ fontSize: "16px" }}>
                                        {memberDetails?.address}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="specific-right">
                            <div style={{ display: "flex", flexDirection: "column", flex: "0.5" }}>
                                <p style={{ fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}><b>Points</b></p>
                                <p style={{ fontSize: "25px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "15px" }}>540</p>
                            </div>
                            <div className="dashboard-title-line"></div>
                            <div style={{ display: "flex", flexDirection: "column", flex: "0.5" }}>
                                <p style={{ fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}><b>Rank</b></p>
                                <p style={{ fontSize: "25px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "15px" }}>{memberDetails?.points}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="member-activebooks-content" id="activebooks@member">
                    <p style={{ fontWeight: "bold", fontSize: "22px", marginTop: "22px", marginBottom: "22px" }}>Issued</p>
                    <table className="activebooks-table">
                        <tr>
                            <th>S.No</th>
                            <th>Book-Name</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Fine</th>
                        </tr>
                        {
                            memberDetails?.activeTransactions?.filter((data) => {
                                return data.transactionType === "Issued"
                            }).map((data, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{data.bookName}</td>
                                        <td>{data.fromDate}</td>
                                        <td>{data.toDate}</td>
                                        <td>{(Math.floor((Date.parse(moment(new Date()).format("MM/DD/YYYY")) - Date.parse(data.toDate)) / 86400000)) <= 0 ? 0 : (Math.floor((Date.parse(moment(new Date()).format("MM/DD/YYYY")) - Date.parse(data.toDate)) / 86400000)) * 10}</td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>

                <div className="member-reservedbooks-content" id="reservedbooks@member">
                    <p style={{ fontWeight: "bold", fontSize: "22px", marginTop: "22px", marginBottom: "22px" }}>Reserved</p>
                    <table className="activebooks-table">
                        <tr>
                            <th>S.No</th>
                            <th>Book-Name</th>
                            <th>From</th>
                            <th>To</th>
                        </tr>
                        {
                            memberDetails?.activeTransactions?.filter((data) => {
                                return data.transactionType === "Reserved"
                            }).map((data, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{data.bookName}</td>
                                        <td>{data.fromDate}</td>
                                        <td>{data.toDate}</td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
                <div className="member-history-content" id="history@member">
                    <p style={{ fontWeight: "bold", fontSize: "22px", marginTop: "22px", marginBottom: "22px" }}>History</p>
                    <table className="activebooks-table">
                        <tr>
                            <th>S.No</th>
                            <th>Book-Name</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Return Date</th>
                        </tr>
                        {
                            memberDetails?.prevTransactions?.map((data, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{data.bookName}</td>
                                        <td>{data.fromDate}</td>
                                        <td>{data.toDate}</td>
                                        <td>{data.returnDate}</td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
            </div>
        </div>
    )
}

export default GetMember

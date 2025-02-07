// Firebase Config (same as before)
const firebaseConfig = {
	apiKey: "AIzaSyAT-WYXg6CJffFeF3nZuSmOu9-1HulOQ0Q",
	authDomain: "work6webapp.firebaseapp.com",
	projectId: "work6webapp",
	storageBucket: "work6webapp.firebasestorage.app",
	messagingSenderId: "842466911737",
	appId: "1:842466911737:web:b42bb9c31517d3340d0928",
	measurementId: "G-8V5JFRDC9P",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

function App() {

    const [user, setUser] = React.useState(null);
    const [students, setStudents] = React.useState([]);
    const [showForm, setShowForm] = React.useState(false);
    const [editingStudent, setEditingStudent] = React.useState(null);
    const [confirmDelete, setConfirmDelete] = React.useState(null);
    
    const defaultStudent = { id: "", title: "", fname: "", lname: "", email: "" };
    const [studentData, setStudentData] = React.useState(defaultStudent);
    const titleOptions = ["นาย", "นางสาว", "นาง"];

    // Authentication functions
    const handleLogin = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error("Error during login:", error);
            alert("Login failed. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error during logout:", error);
            alert("Logout failed. Please try again.");
        }
    };

    // Listen for auth state changes
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (user) {
                // Fetch students when user logs in
                const unsubscribeDb = db.collection("students")
                    .onSnapshot(snapshot => {
                        setStudents(snapshot.docs.map(doc => ({ 
                            id: doc.id, 
                            ...doc.data() 
                        })));
                    }, error => {
                        console.error("Error fetching students:", error);
                    });
                return () => unsubscribeDb();
            } else {
                setStudents([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        setStudentData({ ...studentData, [e.target.name]: e.target.value });
    };

    const openAddForm = () => {
        setStudentData(defaultStudent);
        setEditingStudent(null);
        setShowForm(true);
    };

    const openEditForm = (student) => {
        setStudentData(student);
        setEditingStudent(student.id);
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await db.collection("students").doc(editingStudent).update(studentData);
            } else {
                await db.collection("students").doc(studentData.id).set(studentData);
            }
            setShowForm(false);
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Failed to save student. Please try again.");
        }
    };

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const confirmDeleteStudent = async () => {
        try {
            await db.collection("students").doc(confirmDelete).delete();
            setConfirmDelete(null);
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Failed to delete student. Please try again.");
        }
    };

	return (
		<div className="app-container">
			{user ? (
				<div className="dashboard">
					<div className="dashboard-header">
						<h1 className="app-title">Student Management System</h1>
						<div className="user-panel">
							<div className="user-info">
								<img
									src={user.photoURL}
									alt="profile"
									className="user-avatar"
								/>
								<span>{user.displayName}</span>
							</div>
							<button onClick={handleLogout} className="btn btn-logout">
								<span className="logout-icon">↪</span> Logout
							</button>
						</div>
					</div>
					<button onClick={openAddForm} className="btn btn-add">
						+ Add New Student
					</button>

					<div className="table-container">
						<table className="student-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Title</th>
									<th>First Name</th>
									<th>Last Name</th>
									<th>Email</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{students.map((student) => (
									<tr key={student.id}>
										<td>{student.id}</td>
										<td>{student.title}</td>
										<td>{student.fname}</td>
										<td>{student.lname}</td>
										<td>{student.email}</td>
										<td className="action-buttons">
											<button
												onClick={() => openEditForm(student)}
												className="btn btn-edit"
											>
												Edit
											</button>
											<button
												onClick={() => handleDelete(student.id)}
												className="btn btn-delete"
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{showForm && (
						<div className="form-overlay">
							<div className="form-container">
								<h3>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
								<form onSubmit={handleSave}>
									<div className="input-group">
										<input
											type="text"
											className="form-input"
											placeholder="Student ID (xxxxxxxxx-x)"
											name="id"
											value={studentData.id}
											onChange={handleChange}
											pattern="\d{9}-\d{1}"
											title="Please enter ID in format: xxxxxxxxx-x"
											required
											disabled={!!editingStudent}
										/>
									</div>
									<div className="input-group">
										<select
											className="form-select"
											name="title"
											value={studentData.title}
											onChange={handleChange}
											required
										>
											<option value="">-- Select Title --</option>
											{titleOptions.map((title) => (
												<option key={title} value={title}>
													{title}
												</option>
											))}
										</select>
									</div>
									<div className="input-group">
										<input
											type="text"
											className="form-input"
											placeholder="First Name"
											name="fname"
											value={studentData.fname}
											onChange={handleChange}
											required
										/>
									</div>
									<div className="input-group">
										<input
											type="text"
											className="form-input"
											placeholder="Last Name"
											name="lname"
											value={studentData.lname}
											onChange={handleChange}
											required
										/>
									</div>
									<div className="input-group">
										<input
											type="email"
											className="form-input"
											placeholder="Email"
											name="email"
											value={studentData.email}
											onChange={handleChange}
											required
										/>
									</div>
									<div className="form-buttons">
										<button type="submit" className="btn btn-save">
											{editingStudent ? "Update" : "Add"} Student
										</button>
										<button
											type="button"
											onClick={() => setShowForm(false)}
											className="btn btn-cancel"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					)}

					{confirmDelete && (
						<div className="modal-overlay">
							<div className="modal-content">
								<div className="modal-header">
									<h4>Confirm Delete</h4>
								</div>
								<div className="modal-body">
									<p>Are you sure you want to delete this student?</p>
									<div className="modal-buttons">
										<button
											onClick={confirmDeleteStudent}
											className="btn btn-delete"
										>
											Delete
										</button>
										<button
											onClick={() => setConfirmDelete(null)}
											className="btn btn-cancel"
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="login-page">
					<div className="login-container">
						<div className="login-box">
							<h1 className="login-title">Student Management System</h1>
							<p className="login-subtitle">Please sign in to continue</p>
							<button onClick={handleLogin} className="btn btn-login">
								<img
									src="https://www.google.com/favicon.ico"
									alt="Google"
									className="google-icon"
								/>
								Sign in with Google
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

ReactDOM.render(<App />, document.getElementById("root"));

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQfWU2WdlBhqTmaLwZwLrEyGbmh0WZYoI",
  authDomain: "controllerdash-a380b.firebaseapp.com",
  projectId: "controllerdash-a380b",
  storageBucket: "controllerdash-a380b.appspot.com",
  messagingSenderId: "1003745908894",
  appId: "1:1003745908894:web:d7fcfbbd03e91f6fc6038f",
  measurementId: "G-LG9KY1WQWW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsCollection = collection(db, "students");

const studentForm = document.getElementById("student-form");
const studentList = document.getElementById("student-list");
const totalStudentsEl = document.getElementById("total-students");
const totalLessonsDoneEl = document.getElementById("total-lessons-done");
const totalLessonsRemainingEl = document.getElementById("total-lessons-remaining");

async function renderStudents() {
  studentList.innerHTML = "";
  let totalLessonsDone = 0;
  let totalLessonsRemaining = 0;

  const studentsSnapshot = await getDocs(studentsCollection);
  const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  students.forEach((student) => {
    totalLessonsDone += student.lessonsDone;
    totalLessonsRemaining += (student.totalClasses - student.lessonsDone);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.level}</td>
      <td>
        <div class="progress-bar">
          <div class="progress" style="width: ${(student.lessonsDone/student.totalClasses)*100}%"></div>
        </div>
        ${student.lessonsDone}/${student.totalClasses}
      </td>
      <td>
        <button onclick="incrementLesson('${student.id}')">+1</button>
        <button onclick="deleteStudent('${student.id}')">🗑</button>
      </td>
    `;
    studentList.appendChild(tr);
  });

  totalStudentsEl.textContent = students.length;
  totalLessonsDoneEl.textContent = totalLessonsDone;
  totalLessonsRemainingEl.textContent = totalLessonsRemaining;
}

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const level = document.getElementById("level").value;
  const totalClasses = parseInt(document.getElementById("total-classes").value);

  await addDoc(studentsCollection, { name, email, level, totalClasses, lessonsDone:0 });
  studentForm.reset();
  renderStudents();
});

async function incrementLesson(id) {
  const studentRef = doc(db, "students", id);
  const studentSnapshot = await getDoc(studentRef);
  const studentData = studentSnapshot.data();
  if (studentData.lessonsDone < studentData.totalClasses) {
    await updateDoc(studentRef, { lessonsDone: studentData.lessonsDone + 1 });
    renderStudents();
  }
}

async function deleteStudent(id) {
  const studentRef = doc(db, "students", id);
  await deleteDoc(studentRef);
  renderStudents();
}

// Dark Mode
const themeBtn = document.getElementById("toggle-theme");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme")==="dark") document.body.classList.add("dark");
});

// Inicializar
renderStudents();

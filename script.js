// Importa as funções necessárias do Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Configuração do seu aplicativo web Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAQfWU2WdlBhqTmaLwZwLrEyGbmh0WZYoI",
  authDomain: "controllerdash-a380b.firebaseapp.com",
  projectId: "controllerdash-a380b",
  storageBucket: "controllerdash-a380b.firebasestorage.app",
  messagingSenderId: "1003745908894",
  appId: "1:1003745908894:web:d7fcfbbd03e91f6fc6038f",
  measurementId: "G-LG9KY1WQWW"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsCollection = collection(db, "students");

// Seletores
const studentForm = document.getElementById("student-form");
const studentList = document.getElementById("student-list");
const totalStudentsEl = document.getElementById("total-students");
const totalLessonsDoneEl = document.getElementById("total-lessons-done");
const totalLessonsRemainingEl = document.getElementById("total-lessons-remaining");

// Renderizar estudantes
async function renderStudents() {
  studentList.innerHTML = "";
  let totalLessonsDone = 0;
  let totalLessonsRemaining = 0;

  // Obtém os dados da coleção 'students' no Firestore
  const studentsSnapshot = await getDocs(studentsCollection);
  const students = studentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  students.forEach((student, index) => {
    totalLessonsDone += student.lessonsDone;
    totalLessonsRemaining += (student.totalClasses - student.lessonsDone);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.level}</td>
      <td>
        <div class="progress-bar">
          <div class="progress" style="width: ${(student.lessonsDone / student.totalClasses) * 100}%"></div>
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

// Adicionar aluno
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const level = document.getElementById("level").value;
  const totalClasses = parseInt(document.getElementById("total-classes").value);

  // Adiciona um novo documento à coleção 'students'
  await addDoc(studentsCollection, {
    name,
    email,
    level,
    totalClasses,
    lessonsDone: 0
  });

  studentForm.reset();
  renderStudents();
});

// Incrementar aula
async function incrementLesson(id) {
  const studentRef = doc(db, "students", id);
  const studentSnapshot = await getDoc(studentRef);
  const studentData = studentSnapshot.data();

  if (studentData.lessonsDone < studentData.totalClasses) {
    await updateDoc(studentRef, {
      lessonsDone: studentData.lessonsDone + 1
    });
    renderStudents();
  }
}

// Deletar aluno
async function deleteStudent(id) {
  const studentRef = doc(db, "students", id);
  await deleteDoc(studentRef);
  renderStudents();
}

// Tema escuro/claro
document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Inicializar
renderStudents();
// (Removed duplicate Firebase initialization and configuration)
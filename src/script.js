import "./assets/css/main.css";
import Animation from "./class/Animation.js";

/** FUNCTIONS NAV */
function showGoUp() {
  let scrollY = container.scrollTop;
  const show = scrollY > 0 ? true : false;

  if (show) {
    if (goUpBtn.classList.contains("hide")) goUpBtn.classList.remove("hide");
  } else {
    if (!goUpBtn.classList.contains("hide")) goUpBtn.classList.add("hide");
  }
}

const myAnime = new Animation("canvas.webgl");

// on ajoute un Text en 3D (un @)
// on sassure de rajouter les cubes une fois que le meshText ait bien été ajouté (y a un loader qui prend du temps)

myAnime
  .addMeshText("@")
  .then((data) => {
    // une fois le mesh text ajouté, on peut ajouter les mesh cubes (pour une question d'ordre du DOM)
    // pour chaque section on va créer un cube flottant via les dataset
    const sections = document.querySelectorAll("section.mesh");
    sections.forEach((section) => {
      const id = section.id;
      const data = { id, ...section.dataset };
      myAnime.addMeshCube(data);
    });
    myAnime.alignMeshes();
    myAnime.animate();
    myAnime.animateOnScroll();
    myAnime.animateOnMove();
    myAnime.createParticles(20000);
  })
  .catch((err) => console.log(err));

const btns = document.querySelectorAll(".btn.demo");
btns.forEach((btn) => {
  const idProject = btn.dataset.project;

  btn.addEventListener("click", () => {
    myAnime.goToUrl(idProject);
  });
});

/** ON INIT */
// init element triggered
const container = document.querySelector(".container");
const goNextBtns = document.querySelectorAll("button.go-next");
goNextBtns.forEach((btn, index) => {
  const currentSection = btn.parentElement;
  const indexCurrentSection = Array.from(
    currentSection.parentNode.children
  ).indexOf(currentSection);
  const nextSection = container.children[indexCurrentSection + 1];

  btn.addEventListener("click", () => {
    container.scrollTo({
      top: nextSection.offsetTop,
      behavior: "smooth",
    });
  });
});
const goUpBtn = document.querySelector("button.go-up");
goUpBtn.addEventListener("click", () => {
  container.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
showGoUp();

/** ON SCROLL */
container.addEventListener("scroll", () => {
  showGoUp();
});

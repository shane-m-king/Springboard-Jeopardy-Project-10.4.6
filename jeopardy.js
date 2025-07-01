let categories = []; // Stores category IDs
let clueList = []; // Stores an array of {categoryTitle: title, clues: [array of clues]}, one for each category
const cats = document.getElementById("cats");
const boxes = document.getElementById("boxes");

$("#play-button").click(function (e) {
  handleClick(e);
  setupAndStart();
});
$(".boxes").on("click", ".box", handleClick);

// Picks 6 categories at random from provided API
async function getCategoryIds() {
  categories = [];
  const response = await axios.get(
    "https://rithm-jeopardy.herokuapp.com/api/categories?count=10"
  );
  for (let cat of response.data) {
    categories.push(cat.id);
  }
  categories = _.sampleSize(categories, 6);
}

// Gets a category name and all clues given a category ID
async function getCategory(catId) {
  const clues = [];
  const response = await axios.get(
    `https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`
  );
  for (let clue of response.data.clues) {
    clues.push({
      question: clue.question,
      answer: clue.answer,
    });
  }
  return { title: response.data.title, clues: clues };
}

async function fillTable(catArr) {
  for (let cat = 1; cat <= 6; cat++) {
    let catTitle = await getCategory(categories[cat - 1]);
    clueList.push(catTitle);
    $(".cats").append(
      `<div class="category">${catTitle.title.toUpperCase()}</div>`
    );
  }

  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 6; col++) {
      $(".boxes").append(
        `<div class="box" data-col="${col}" data-row="${row}" data-state="start">$${
          row * 2
        }00</div>`
      );
    }
  }
}

async function handleClick(e) {
  if (e.target.dataset.state === "start") {
    let cat = clueList[e.target.dataset.col - 1];
    e.target.style.color = "white";
    e.target.style.fontSize = "0.9rem";
    e.target.innerHTML = cat.clues[e.target.dataset.row - 1].question;
    e.target.dataset.state = "question";
  } else if (e.target.dataset.state === "question") {
    let cat = clueList[e.target.dataset.col - 1];
    e.target.style.fontSize = "1.5rem";
    e.target.style.backgroundColor = "green";
    e.target.innerHTML = cat.clues[e.target.dataset.row - 1].answer;
    e.target.dataset.state = "answer";
  } else if (e.target.innerHTML === "Start!") {
    e.target.innerHTML = "Restart!";
  }
}

function showLoadingView() {
  $("#loading").show();
  $("#play-button").prop("disabled", true);
}

function hideLoadingView() {
  $("#loading").hide();
  $("#play-button").prop("disabled", false);
}

async function setupAndStart() {
  $(".container").hide();
  showLoadingView();
  await new Promise((wait) => setTimeout(wait, 100));
  categories = [];
  clueList = [];
  cats.innerHTML = "";
  boxes.innerHTML = "";
  await getCategoryIds();
  await fillTable(categories);
  hideLoadingView();
  $(".container").show();
}

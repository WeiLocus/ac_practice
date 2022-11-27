//宣告GAME_STATE來定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished"
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
];

//物件與物件之間要用逗號隔開
const view = {
  //把卡片索引 (0~51) 綁定在牌背的 template 裡
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },
  getCardContent(index) {
    const number = this.transformNummber((index % 13) + 1); //卡牌數字是index除以13後的 餘數 +1
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src="${symbol}" alt="">
        <p>${number}</p>
    `;
  },
  transformNummber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  //翻轉卡片，如果是背面：點擊後移除封面、如果是正面，加上back
  //flipCards(1,2,3,4,5) ; cards = [1,2,3,4,5]
  flipCards(...cards) {
    // console.log(card)
    //用map來迭代
    cards.map((card) => {
      if (card.classList.contains("back")) {
        //回傳正面
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index)); //用card.dataset.index的號碼帶入，改為數字
        return;
      }
      //回傳背面
      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  // displayCards() {
  //   const rootElement = document.querySelector('#cards')
  //   // rootElement.innerHTML = this.getCardElement(51)
  //   //產生52張牌，用map迭代陣列並依序將數字丟進view.getCardElement()，會變成有52張卡片的陣列
  //   //用join("")把陣列合併成一個大字串，才能當成HTML template來使用，innerHTML需要的是字串
  //   //1.rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("")
  //   rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join("")
  // }

  //改寫：參數indexes為打散過的陣列傳進來，不要跟utility耦合
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  //配對成功時卡片加上paired
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  //render score&try times
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      //動畫沒辦法重播，另外加入監聽器在動畫結束後把class wrong移除掉
      card.addEventListener(
        "animationend",
        (e) => {
          card.classList.remove("wrong");
        },
        {
          once: true //監聽器觸發一次後就消失，優化瀏覽器載入效率
        }
      );
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes}times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div); //div加在header前面
  }
};

//宣告model，集中管理資料
const model = {
  revealedCards: [], //revealedCards暫存牌組
  //比對翻開的兩張牌是否相等
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0
};

//宣告Controller物件，依造遊戲狀態來分配動作，用controller來呼叫view和model
const controller = {
  //初始狀態設定為 FirstCardAwaits，也就是「還沒翻牌」
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  //翻牌時呼叫controller推進遊戲進度
  disPatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      //第一狀態
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card); //當GAME_STATE=等待翻第一張牌，翻牌
        model.revealedCards.push(card); //把第一張牌存在revealedCards暫存牌組陣列
        this.currentState = GAME_STATE.SecondCardAwaits; //把狀態改為等待翻第二張牌
        break;
      //第二狀態
      case GAME_STATE.SecondCardAwaits:
        //只要切換至 SecondCardAwaits，嘗試次數就要+1
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        // console.log(model.isRevealedCardsMatched())
        if (model.isRevealedCardsMatched()) {
          //配對正確後分數加十，狀態機改為matched
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardMatched;
          // view.pairCard(model.revealedCards[0]) //第一張牌
          // view.pairCard(model.revealedCards[1]) //第二張牌
          view.pairCards(...model.revealedCards);
          model.revealedCards = []; //清空
          if (model.score === 260) {
            console.log("showGameFinished");
            this.current = GAME_STATE.GameFinished;
            view.showGameFinished();
            return; //結束
          }
          this.currentState = GAME_STATE.FirstCardAwaits; //回到初始狀態
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
          // setTimeout(() => {
          //   // view.flipCard(model.revealedCards[0]) //變成牌背
          //   // view.flipCard(model.revealedCards[1])
          //   view.flipCards(...model.revealedCards)
          //   model.revealedCards = []
          //   this.currentState = GAME_STATE.FirstCardAwaits //回到初始狀態
          // },1000)
        }
        break;
    }
    console.log("currentState: ", this.currentState);
    console.log("reveales card: ", model.revealedCards);
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};

//洗牌演算法：Fisher-Yates Shuffle
const utility = {
  getRandomNumberArray(count) {
    //count =5 => [2,3,4,1,0] 隨機
    const number = Array.from(Array(count).keys());
    //從最後一張牌可以換牌，做到第二張牌
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ]; //解構賦值
      //[1,2,3,4,5]中 1和5要交換
      //const temp = 1
      //arr[4] = temp
      //arr[0] = 5
    }
    return number;
  }
};

controller.generateCards();
//使用 querySelectorAll 來抓到所有與.card 選擇器匹配的元素，會回傳一個 NodeList
//再使用 forEach 來迭代回傳值，為每張卡牌加上事件監聽器
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", function (event) {
    console.log(event.target);
    // console.log(card)
    //初始 view.flipCard(card)
    controller.disPatchCardAction(card);
  });
});

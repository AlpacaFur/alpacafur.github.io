const cards = [
  {
    name:"Halloween",
    month:"Oct",
    day:"31",
    color:"DarkOrange",
    text:"Black"
  },
  {
    name:"Christmas",
    month:"Dec",
    day:"25",
    color:"DarkRed",
    text:"White"
  },
  {
    name:"Forth of July",
    month:"Jul",
    day:"4",
    color:"#1E2D5C"
  },
  {
    name:"Thanksgiving",
    month:"Nov",
    pos:"4th",
    day:"Thu",
    color:"#F0B840",
    text:"#6F0B06"
  },
  {
    name:"New Year's Day",
    month:"Jan",
    day:"1",
    color:"#010B33",
  },
  {
    name:"Valentine's Day",
    month:"Feb",
    day:"14",
    color:"#D41436"
  },
  {
    name:"The Future",
    month:"Jan",
    day:"1",
    year:"3000"
  }
]

let cardsToInsert = [];
for (let event of cards) {
  let card = document.createElement("div")
  card.classList.add("row");
  let name = document.createElement("p")
  let date = document.createElement("p")
  name.appendChild(document.createTextNode(event.name))
  let targetDate;
  let today = new Date();
  let oneDay = 1000*60*60*24
  if (event.year) {
    targetDate = new Date(event.year, getMonth(event.month), event.day)
    console.log(targetDate.toString());
    date.appendChild(document.createTextNode(`${event.month} ${targetDate.getDate()}, ${targetDate.getFullYear()}`))
  }
  else {
    if (event.pos) {
      targetDate = calcSpecialDate(event.pos, event.day, event.month, today.getFullYear())
    }
    else {
      targetDate = new Date(today.getFullYear(), getMonth(event.month), event.day)
    }
    if (today.getTime() > targetDate.getTime()) {
      targetDate.setFullYear(targetDate.getFullYear()+1)
    }
    date.appendChild(document.createTextNode(event.month + " " + targetDate.getDate()))
  }
  let days = document.createElement("p")
  days.appendChild(document.createTextNode("in "+Math.ceil((targetDate.getTime()-today.getTime())/oneDay) + " days"))
  name.style.color = event.text
  name.classList.add("name")
  card.appendChild(name)
  date.style.color = event.text
  date.classList.add("date")
  card.appendChild(date)
  days.style.color = event.text
  days.classList.add("days")
  card.appendChild(days)
  card.style.backgroundColor = event.color;
  cardsToInsert.push({card:card,date:targetDate})
}
cardsToInsert.sort((e1,e2)=>{
  return e1.date.getTime() - e2.date.getTime()
})
let cardsDiv = document.getElementById("cards")
for (let card of cardsToInsert) {
  cardsDiv.appendChild(card.card)
}


function getMonth(name) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(name)
}
function getDay(name) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(name)
}
function getPosition(pos) {
  return pos.slice(0,1)-1
}
function calcSpecialDate(position, day, month, year) {
  month = getMonth(month)
  day = getDay(day)
  let date = new Date(year, month, 1)
  let firstDay = date.getDay()
  let firstxDay = firstDay > day ? 7-(firstDay-day) + 1 : firstDay == day ? 1 : day-firstDay+1
  date.setDate(firstxDay + 7*getPosition(position))
  return date;
}

function editMode(e, field) {}

document.addEventListener("click", (e)=>{
  console.log(e.target.classList.values());
  if (e.target.classList.contains("name")) {
    editMode(e)
  }
  if (e.target.classList.contains("days")) {

  }
  if (e.target.classList.contains("date")) {

  }
})

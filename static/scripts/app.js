console.log(`app here!`);

// STATE and APP VARS

let STATE_allHosts = []; //? The original list of hosts fetched
let STATE_allHostsToShow = []; //? Subset of hosts to be displayed (can be all or search results, for example)
let STATE_allVisibleHosts = [];
let DELETE_hosts = [];
let VAR_quantityToShow = 10; //? The quantity of hosts to show (or add) at a time
let VAR_chunkQuantity = 1; //! How many of the chunks we are showing
let VAR_isAZ = true; //! Toggles the alphabetization from A->Z or Z->A

// UTILITIES
const alpha = (arr, order) => {
  //? Sorts the array from Z-A
  // console.log(arr);
  order === 'za'
    ? arr.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1))
    : //? Sorts the array from A-Z by default if null or anything else is passed
      arr.sort((a, b) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      );
  return arr;
};

// TODO figure out how to be at the bottom of the div (and also the correct size)
function scrollToBottom(el) {
  el.scrollTop = el.scrollHeight - el.clientHeight;
}

// GET INITIAL STATE

function init() {
  axios
    .get('/get-hosts')
    .then(function(response) {
      return response.data;
    })
    .then(function(response) {
      return response;
    })
    .then(function(response) {
      // console.log(response);
      //? Default sort them here because they may as well be in order
      return setHosts(alpha(response));
    })
    .catch(function(error) {
      console.log(error);
    });
}

init();

// WHERE STATE GETS SET AFTER SERVER REQUEST/UPDATE
function setHosts(newHosts) {
  //? Set the "official" list of hosts
  // console.log(newHosts);
  STATE_allHosts = [...newHosts];
  console.log(`All Hosts`);
  console.dir(STATE_allHosts);
  STATE_allHostsToShow = [...STATE_allHosts];
  //? Pass list to render function
  setHostsToShow(STATE_allHosts);
}

// IN MOST CASES THIS IS WHERE YOU START RERENDER
function setHostsToShow(hostsToShow) {
  STATE_allHostsToShow = [...hostsToShow];
  renderDropdown(STATE_allHostsToShow);
}

// DOM NODES
const dropdown = document.querySelector('.dropdown-container');
const dropdownList = document.querySelector('ul.list-group');
const searchList = document.querySelector('ul.list-group');

const allButtons = dropdown.querySelectorAll('button');
allButtons.forEach((i) => {
  i.addEventListener('click', (e) => e.stopPropagation());
});

function stopItemPropagation() {
  const allItems = dropdown.querySelectorAll('.host-list__item');
  allItems.forEach((i) => {
    i.addEventListener('click', (e) => e.stopPropagation());
  });
}

// PASS HERE FIRST TO CUT IT UP

// RENDER DROPDOWN
// PASS WHATEVER NEEDS TO BE RENDERED HERE
function renderDropdown(hosts) {
  dropdownList.innerHTML = '';
  //? Computes the total # of hosts to show
  STATE_allVisibleHosts = hosts.slice(
    0,
    VAR_quantityToShow * VAR_chunkQuantity
  );
  console.log(`Visible Hosts`);
  console.table(STATE_allVisibleHosts);

  let listItems = [...STATE_allVisibleHosts].map((j) => {
    return `<li class="list-group-item host-list__item" data-id=${j.id}>

    <span class="hostName">${j.name}</span> <input type="checkbox" value=${
      j.id
    } ${j.checked ? 'checked' : ''}>
  </li>`;
  });

  dropdownList.insertAdjacentHTML('afterbegin', listItems.join(''));

  stopItemPropagation();
  initCheckboxFxns(hosts);
}

// SHOW MORE BUTTON

const showMoreButton = document.querySelector('.show-more');
// console.log(showMoreButton);
showMoreButton.addEventListener('click', (e) => {
  e.stopPropagation();
  VAR_chunkQuantity++;
  console.log(VAR_chunkQuantity);
  renderDropdown(STATE_allHostsToShow);
  scrollToBottom(dropdownList);
});

// SEARCH //* FUNCTIONING AGAIN :)
var searchInputField = document.querySelector('input[type="search"]');
searchInputField.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  console.log(term);
  let matchedHosts = STATE_allHosts.filter((i) =>
    i.name.toLowerCase().includes(term)
  );
  // increase chunk quantity to be "infinite" so all search results show, and return to normal state if query is 0 (this could be improved to not hijack the user's "shown" amount but it's ok)
  console.log(e.target.value.length);
  e.target.value.length > 0
    ? (VAR_chunkQuantity = 999999)
    : (VAR_chunkQuantity = 1);

  if (matchedHosts.length <= 0) {
    console.log(`There's no matches`);
    dropdownList.innerHTML = '';
    dropdownList.insertAdjacentHTML(
      'afterbegin',
      '<li class="list-group-item">😔 Sorry, there are no matches.</li>'
    );
    showMoreButton.classList.add('d-none');
  } else {
    setHostsToShow(matchedHosts);
    showMoreButton.classList.toggle('d-none');
  }
});

// SORT
const sortButton = document.querySelector('.sort-btn');
sortButton.addEventListener('click', () => {
  console.log('sort the stuff');
  renderDropdown([...STATE_allVisibleHosts].reverse());
});

// ADD RANDOM HOST
const addRandomButton = document.querySelector('#add-random-host');
addRandomButton.addEventListener('click', () => {
  console.log(`add random`);
  axios
    .get('/get-random-host')
    .then(function(response) {
      // console.log(response);
      return response.data;
    })
    .then(function(response) {
      // console.log(response);
      const newState = [response, ...STATE_allHosts];
      console.log(newState);
      setHosts(newState);
    })
    .catch(function(error) {
      console.log(error);
    });
});

// CHECKBOX HANDLERS
function initCheckboxFxns(hosts) {
  var hostListItems = document.querySelectorAll('.host-list__item input');
  // console.log(hostListItems);

  hostListItems.forEach((b) => {
    // console.log(b.checked);
    b.addEventListener('change', (e) => {
      // console.log('CHANGEMEEEE');
      // console.log(e.target.value);
      // need to persist this to state in case someone sorts or shows more
      // fully understand its expensive to re-render... in a refactor i COULD tie the state setting to collect all visible checked and THEN set state right before rerender
      // this is where actual lifecycle methods would've been useful, but alas.
      let allItems = [...STATE_allHosts];
      const itemToChange = e.target.value;
      allItems.map((i) => {
        if (i.id === itemToChange) {
          i.checked = e.target.checked;
        }
      });
      setHosts(allItems);
    });
  });
}

// CHECK ALL
const checkButton = document.querySelector('.check-all');
checkButton.addEventListener('change', (e) => {
  console.log('checkButtonclicked');
  let allItems = [...STATE_allHosts];
  let itemsToChange = [...STATE_allVisibleHosts];
  console.log(e.target);
  e.target.checked === false
    ? itemsToChange.forEach((item) => (item.checked = false))
    : itemsToChange.forEach((item) => (item.checked = true));
  console.table(itemsToChange);
  // For each item in itemsToChange, modify the item in all Items.
  itemsToChange.forEach((i) => {
    console.log(i.id);
    allItems.map((j) => {
      i.id === j.id ? (i.checked = j.checked) : null;
    });
    // console.log(allItems);
  });

  return setHosts(allItems);
});

const deleteButton = document.querySelector('.delete-btn');
deleteButton.addEventListener('click', (e) => {
  let postDeleteHosts = [...STATE_allHosts].filter((i) => i.checked === false);
  console.log(postDeleteHosts);
});
// return buddyStateUpdater(checkedItems);

// Check/Uncheck all
// const checkAllBox = document.querySelector('.toggleAll');
// checkAllBox.addEventListener('change', (e) => {
//   let arr = [...STATE_allHosts];
//   e.target.checked === true
//     ? arr.forEach((item) => (item.checked = true))
//     : arr.forEach((item) => (item.checked = false));

//   return setState(arr);
// });

// SELECT ALL

// DELETE ALL SELECTED

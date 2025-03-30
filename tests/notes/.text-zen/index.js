class Test {
  insert() {
    const inserted = document.createElement('div')
    inserted.innerText = 'inserted'
    inserted.style.position = 'fixed'
    inserted.style.top = '0px'
    document.querySelector('body').appendChild(inserted)
  }
}

const test = new Test()
test.insert()

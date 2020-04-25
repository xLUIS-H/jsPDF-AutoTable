'use strict'

const { before, it, describe } = global
const assert = require('assert')
const { parseHtml } = require('../src/htmlParser')
const { DocHandler } = require('../src/documentHandler')

describe('html parser', () => {
  let doc

  before(function () {
    global.window = {
      document: {
        createElementNS: function () {
          return {}
        },
      },
      getComputedStyle: () => {
        return { display: 'visible' }
      },
    }
    global.navigator = {}
    let jsPDF = require('jspdf')
    doc = new DocHandler(new jsPDF())
  })

  after(function () {
    delete global.window
    delete global.navigator
  })

  it('full table', function () {
    const table = {
      rows: [
        {
          parentNode: { tagName: 'THEAD' },
          cells: [{ cloneNode: () => ({ innerText: 'test', innerHTML: '' }) }],
        },
        {
          parentNode: { tagName: 'TBODY' },
          cells: [
            { cloneNode: () => ({ innerText: 'test', innerHTML: '' }) },
            { cloneNode: () => ({ innerText: 'test', innerHTML: '' }) },
          ],
        },
        {
          parentNode: { tagName: 'TFOOT' },
          cells: [{ cloneNode: () => ({ innerText: 'test', innerHTML: '' }) }],
        },
      ],
    }
    let res = parseHtml(doc, table)
    assert(res, 'Should have result')
    assert(res.head[0].length, 'Should have head cell')
    assert.equal(res.body[0].length, 2, 'Should have two body cells')
    assert(res.foot[0].length, 'Should have foot cell')
  })

  it('hidden content', function () {
    const table = {
      rows: [
        { parentNode: { tagName: 'THEAD' }, cells: [{ innerText: 'test' }] },
        { parentNode: { tagName: 'TBODY' }, cells: [{ innerText: 'test' }] },
        { parentNode: { tagName: 'TFOOT' }, cells: [{ innerText: 'test' }] },
      ],
    }
    global.window = {
      getComputedStyle: function () {
        return { display: 'none' }
      },
    }
    let res = parseHtml(doc, table)
    assert(res, 'Should have result')
    assert(res.head.length === 0, 'Should have no head cells')
    assert(res.body.length === 0, 'Should have no body cell')
    assert(res.foot.length === 0, 'Should have no foot cells')
  })

  it('empty table', function () {
    const table = {
      rows: [
        { parentNode: { tagName: 'THEAD' }, cells: [] },
        { parentNode: { tagName: 'TBODY' }, cells: [] },
        { parentNode: { tagName: 'TFOOT' }, cells: [] },
      ],
    }

    const res = parseHtml(doc, table)
    assert(res, 'Should have result')
    assert(res.head.length === 0, 'Should have no head cells')
    assert(res.body.length === 0, 'Should have no body cells')
    assert(res.foot.length === 0, 'Should have no foot cells')
  })
})

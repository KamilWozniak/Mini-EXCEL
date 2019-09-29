<template>
  <div class="app">
    <div class="excel-container">
      <div class="excel-container__main-form">
        <form @submit.prevent="handleMainInputSubmit">
          <input class="main-form__input"
                 type="text"
                 :value="focusedCellQuery"
                 @input="handleMainInput($event.target.value)">

          <button class="main-form__btn">policz</button>
        </form>
      </div>

      <div class="excel-container__main-grid"
           :style="gridStyles">

        <div class="main-grid__empty-cell"></div>
        <div v-for="number in gridColumns"
             :key="`letter_${number}`"
             class="main-grid__column-letter__wrapper">

          <p class="main-grid__column-letter">
            {{letters[number-1]}}
          </p>
        </div>
        <div v-for="number in gridRows"
             :key="`index_row_${number}`"
             :style="{ gridColumn:  1, gridRow: number+1}"
             class="main-grid__row-index__wrapper">

          <p class="main-grid__row-index">{{number}}</p>
        </div>
        <div v-for="cell in gridCells"
             :key="`r_${cell.row}_c_${cell.column}`"
             class="main-grid__cell"
             :style="getCellWrapperStyles(cell.row - 1, cell.column - 1)">


          <form class="main-grid__cell__form"
                @submit.prevent="handleSingleCellFormSubmit(
                  cell.row - 1, cell.column - 1, $event.target)"
                @dblclick="handleCellDoubleClick(cell.row - 1,
                  cell.column - 1)">

            <input type="text"
                   class="main-grid__cell__input"
                   :ref="`row_${cell.row - 1}_col_${cell.column - 1}`"
                   :key="`row_${cell.row - 1}_col_${cell.column - 1}`"
                   :readonly="decideIfReadOnly(cell.row - 1, cell.column - 1)"
                   @focus="handleCellFocus(cell.row - 1, cell.column - 1)"
                   @blur="handleCellBlur(cell.row - 1, cell.column - 1)"
                   @input="handleCellInput(cell.row - 1, cell.column - 1, $event.target.value)"
                   :value="decideIfDisplayQueryOrValue(cell.row - 1, cell.column - 1)"
                   :class="{'main-grid__cell--focused'
                    : checkIfFocused(cell.row - 1, cell.column - 1)}">

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import styles from '../assets/styles/main.scss';

export default {
  name: 'excel-app',
  data() {
    return {
      gridColumns: 10,
      gridRows: 10,
      currentlyFocusedCell: {
        row: 0,
        column: 0,
      },
      isCellInQueryMode: false,
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W'],
      valuesArray: [],
    };
  },
  computed: {
    gridCells() {
      const cells = [];
      for (let i = 1; i <= this.gridRows; i += 1) {
        for (let j = 1; j <= this.gridColumns; j += 1) {
          cells.push({
            column: j,
            row: i,
          });
        }
      }
      return cells;
    },

    gridStyles() {
      return {
        gridTemplateColumns: `${styles.rowIndexWidth} repeat(${this.gridColumns}, ${styles.cellWidth})`,
        gridTemplateRows: `${styles.columnLetterHeight} repeat(${this.gridRows}, ${styles.cellHeight})`,
      };
    },

    focusedCellQuery() {
      return this.valuesArray[this.currentlyFocusedCell.row][this.currentlyFocusedCell.column]
        .insertedQuery;
    },
  },
  methods: {
    createEmptyValuesArray() {
      for (let i = 0; i < this.gridRows; i += 1) {
        const oneRow = [];
        for (let j = 0; j < this.gridColumns; j += 1) {
          oneRow.push({
            value: '',
            insertedQuery: '',
            isFocused: false,
          });
          if (j === this.gridColumns - 1) {
            this.valuesArray.push(oneRow);
          }
        }
      }
    },

    getCellWrapperStyles(row, col) {
      if (this.decideIfExpandCell(row, col)) {
        const cell = this.valuesArray[row][col];
        if (this.isCellInQueryMode && this.checkIfCellQueryOverflow(row, col)) {
          return {
            zIndex: 10,
            width: `${this.measureTextWidth(cell.insertedQuery)}px`,
          };
        } if (this.checkIfCellValueOverflow(row, col)) {
          return {
            zIndex: 10,
            width: `${this.measureTextWidth(cell.value)}px`,
          };
        }
      }
      return '';
    },

    decideIfReadOnly(row, col) {
      return this.checkIfCellQueryIsFunction(row, col) && !this.isCellInQueryMode;
    },

    decideIfDisplayQueryOrValue(row, col) {
      if (this.valuesArray[row][col].isFocused && this.isCellInQueryMode) {
        return this.valuesArray[row][col].insertedQuery;
      }
      return this.valuesArray[row][col].value;
    },

    checkIfFocused(row, col) {
      return row === this.currentlyFocusedCell.row && col === this.currentlyFocusedCell.column;
    },

    summate(operands) {
      if (operands.length === 1) {
        return 'Err';
      }
      let total = 0;
      for (let i = 0; i < operands.length; i += 1) {
        total += parseFloat(operands[i]);
      }
      return total;
    },

    multiply(operands) {
      if (operands.length === 1) {
        return 'Err';
      }
      let total = 1;
      for (let i = 0; i < operands.length; i += 1) {
        total *= parseFloat(operands[i]);
      }
      return total;
    },

    checkIfStringIsDigit(potentialDigit) {
      if (potentialDigit.length === 0) {
        return false;
      }
      let isDigit = true;
      for (let i = 0; i < potentialDigit.length; i += 1) {
        if (potentialDigit.charCodeAt(i) < 45
            || potentialDigit.charCodeAt(i) > 57
            || potentialDigit.charCodeAt(i) === 47) {
          isDigit = false;
          break;
        }
      }
      return isDigit;
    },

    getColIndexFromColLetter(colLetter) {
      let colNumber = null;
      this.letters.forEach((letter, index) => {
        if (letter === colLetter) {
          colNumber = index;
        }
      });
      return colNumber;
    },

    extractRowAndColFromCellIndex(cellIndex) {
      let numberStart = null;
      for (let i = 0; i < cellIndex.length; i += 1) {
        if (cellIndex.charCodeAt(i) > 47 && cellIndex.charCodeAt(i) < 58) {
          numberStart = i;
          break;
        }
      }
      return {
        row: cellIndex.slice(numberStart) - 1,
        column: this.getColIndexFromColLetter(cellIndex.slice(0, numberStart)),
      };
    },

    defineRangeDirection(rangeOperandsArray) {
      const start = this.extractRowAndColFromCellIndex(rangeOperandsArray[0]);
      const end = this.extractRowAndColFromCellIndex(rangeOperandsArray[1]);

      if (start.column === end.column) {
        return 'VERTICAL';
      }
      if (start.row === end.row) {
        return 'HORIZONTAL';
      }
      return 'UNSPECIFIED';
    },

    checkIfCellIndex(data) {
      let isCellIndex = false;
      for (let i = 1; i <= this.gridRows; i += 1) {
        for (let j = 0; j < this.gridColumns; j += 1) {
          if (data === `${this.letters[j]}${i}`) {
            isCellIndex = true;
            break;
          }
        }
      }
      return isCellIndex;
    },

    trimArrayElements(arr) {
      const trimmedArray = [];
      arr.forEach(element => trimmedArray.push(element.trim()));
      return trimmedArray;
    },

    checkIfAllElementsAreCellIndexes(arr) {
      let areCellIndexes = true;
      arr.forEach((element) => {
        if (!this.checkIfCellIndex(element)) {
          areCellIndexes = false;
        }
      });
      return areCellIndexes;
    },

    checkIfCellIsEmpty(row, col) {
      return this.valuesArray[row][col].value === '';
    },

    checkIfIsValidOperand(row, col) {
      return this.checkIfStringIsDigit(this.valuesArray[row][col].value)
        && !this.checkIfCellIsEmpty(row, col);
    },

    addValuesFromRangeToArray(arr, rangeOperands) {
      const direction = this.defineRangeDirection(rangeOperands);
      const startRange = this.extractRowAndColFromCellIndex(rangeOperands[0]);
      const endRange = this.extractRowAndColFromCellIndex(rangeOperands[1]);

      if (direction === 'VERTICAL') {
        if (startRange.row > endRange.row) {
          [startRange.row, endRange.row] = [endRange.row, startRange.row];
        }
        for (let i = startRange.row; i <= endRange.row; i += 1) {
          if (this.checkIfIsValidOperand(i, startRange.column)) {
            arr.push(this.valuesArray[i][startRange.column].value);
          } else {
            arr.unshift(null);
          }
        }
      }

      if (direction === 'HORIZONTAL') {
        if (startRange.column > endRange.column) {
          [startRange.column, endRange.column] = [endRange.column, startRange.column];
        }
        for (let i = startRange.column; i <= endRange.column; i += 1) {
          if (this.checkIfIsValidOperand(startRange.row, i)) {
            arr.push(this.valuesArray[startRange.row][i].value);
          } else {
            arr.unshift(null);
          }
        }
      }

      if (direction === 'UNSPECIFIED') {
        arr.unshift(null);
      }
    },

    parseRangeOperand(parsedOperandsArray, rangeOperand) {
      const rangeOperandsArray = this.trimArrayElements(rangeOperand.split(':'));

      if (!this.checkIfAllElementsAreCellIndexes(rangeOperandsArray)) {
        parsedOperandsArray.unshift(null);
        return;
      }
      this.addValuesFromRangeToArray(parsedOperandsArray, rangeOperandsArray);
    },

    parseCellIndexOperand(parsedOperandsArray, cellIndexOperand) {
      const cell = this.extractRowAndColFromCellIndex(cellIndexOperand);
      if (this.checkIfIsValidOperand(cell.row, cell.column)) {
        parsedOperandsArray.push(this.valuesArray[cell.row][cell.column].value);
      } else {
        parsedOperandsArray.unshift(null);
      }
    },

    parseOperands(operands) {
      const newOperands = [];

      operands.forEach((untrimmedOperand) => {
        const operand = untrimmedOperand.trim().toUpperCase();

        if (operand.includes(':')) {
          this.parseRangeOperand(newOperands, operand);
          return;
        }

        if (this.checkIfStringIsDigit(operand)) {
          newOperands.push(parseFloat(operand));
          return;
        }

        if (this.checkIfCellIndex(operand)) {
          this.parseCellIndexOperand(newOperands, operand);
        } else {
          newOperands.unshift(null);
        }
      });
      return newOperands;
    },

    parseCellQuery(row, col) {
      const cell = this.valuesArray[row][col];
      const cellQuery = cell.insertedQuery;

      if (this.checkIfCellQueryIsFunction(row, col)) {
        const operation = cellQuery.slice(1, 4);
        const operands = this.parseOperands(cellQuery.slice(5, -1).split(','));

        if (operands[0] === null) {
          cell.value = 'Err';
          return;
        }
        switch (operation) {
          case 'SUM': {
            cell.value = this.summate(operands);
            break;
          }
          case 'MUL': {
            cell.value = this.multiply(operands);
            break;
          }
          default: {
            cell.value = 'Err';
          }
        }
      } else {
        cell.value = cellQuery;
      }
    },

    checkIfCellQueryIsFunction(row, col) {
      const cell = this.valuesArray[row][col];
      const lastChar = cell.insertedQuery[cell.insertedQuery.length - 1];
      const fifthChar = cell.insertedQuery[4];
      return cell.insertedQuery[0] === '=' && fifthChar === '(' && lastChar === ')';
    },

    handleCellFocus(row, col) {
      if (this.checkIfCellIsEmpty(row, col)
        || !this.checkIfCellQueryIsFunction(row, col)) {
        this.isCellInQueryMode = true;
      }
      this.valuesArray[row][col].isFocused = true;
      this.currentlyFocusedCell.column = col;
      this.currentlyFocusedCell.row = row;
      this.updateSpreadsheet();
    },

    handleCellDoubleClick(row, col) {
      this.isCellInQueryMode = true;
      this.valuesArray[row][col].isFocused = true;
    },

    handleCellBlur(row, col) {
      this.valuesArray[row][col].isFocused = false;
      this.isCellInQueryMode = false;
      this.updateSpreadsheet();
    },

    handleCellInput(row, col, value) {
      this.valuesArray[row][col].insertedQuery = value;
    },

    checkIfCellQueryOverflow(row, col) {
      const cell = this.valuesArray[row][col];
      return this.measureTextWidth(cell.insertedQuery) > (96);
    },

    checkIfCellValueOverflow(row, col) {
      const cell = this.valuesArray[row][col];
      return this.measureTextWidth(cell.value) > (96);
    },

    decideIfExpandCell(row, col) {
      return !!((this.checkIfCellValueOverflow(row, col)
        || this.checkIfCellQueryOverflow(row, col))
        && this.checkIfFocused(row, col));
    },

    measureTextWidth(text) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      ctx.font = 'normal 14pt lato';
      return Math.ceil(ctx.measureText(text).width);
    },

    handleMainInput(value) {
      this.valuesArray[this.currentlyFocusedCell.row][this.currentlyFocusedCell.column]
        .insertedQuery = value;
    },

    handleMainInputSubmit() {
      this.updateSpreadsheet();
      if (this.currentlyFocusedCell.row < (this.gridRows - 1)) {
        this.currentlyFocusedCell.row += 1;
      }
    },

    recalculateSpreadsheet() {
      for (let i = 0; i < this.gridRows; i += 1) {
        for (let j = 0; j < this.gridColumns; j += 1) {
          this.parseCellQuery(i, j);
        }
      }
    },

    handleSingleCellFormSubmit(row, col, target) {
      this.valuesArray[row][col].isFocused = false;
      this.updateSpreadsheet();
      if (this.currentlyFocusedCell.row < (this.gridRows - 1)) {
        this.currentlyFocusedCell.row += 1;
        this.valuesArray[row + 1][col].isFocused = true;
        target.childNodes[0].blur();
        this.focusCell(row + 1, col);
        this.dispatchDoubleClickOnCell(row + 1, col);
      } else {
        this.handleCellBlur(row, col);
      }
    },

    focusCell(row, col) {
      const cell = this.$refs[`row_${row}_col_${col}`][0];
      cell.focus();
    },

    dispatchDoubleClickOnCell(row, col) {
      const cell = this.$refs[`row_${row}_col_${col}`][0];
      const clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('dblclick', true, true);
      cell.dispatchEvent(clickEvent);
    },

    updateSpreadsheet() {
      this.recalculateSpreadsheet();
      this.recalculateSpreadsheet();
    },
  },
  created() {
    this.createEmptyValuesArray();
  },
};
</script>
<style scoped lang="scss">

.app {
  height: 100vh;
  width: 100vw;
  background-color: $grey-200;
  display: flex;
  align-items: center;
  justify-content: center;

  .excel-container {
    width: 97rem;
    height: auto;
    background-color: $grey-300;

    &__main-form {
      background-color: white;
      height: 8rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .main-form {
        &__input {
          width: 50rem;
          min-height: 4rem;
          border-right: none;
          border-top: $main-input-border;
          border-bottom: $main-input-border;
          border-left: $main-input-border;

          &:focus {
            outline: none;
          }
        }

        &__btn {
          cursor: pointer;
          padding: 5px 1rem;
          min-height: 4rem;
          border-left: none;
          border-right: $main-input-border;
          border-top: $main-input-border;
          border-bottom: $main-input-border;
          text-transform: uppercase;

          &:hover {
            background-color: $grey-200;
          }

          &:focus {
            outline: none;
          }
        }
      }
    }

    &__main-grid {
      width: 100%;
      height: 100%;
      background-color: $grey-400;
      display: grid;
      grid-gap: 0;

      .main-grid {
        &__empty-cell {
          background-color: $cell-color;
          border: 1px solid $grey-400;
        }

        &__column-letter {
          height: fit-content;

          &__wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: $cell-color;
            border: 1px solid $grey-400;
          }
        }

        &__row-index {
          width: fit-content;

          &__wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: $cell-color;
            border: 1px solid $grey-400;
          }
        }

        &__cell {
          background-color: lighten($cell-color, 10);

          &--focused {
            background-color: $grey-200;
            outline: none;
            border: 2px solid $black;
          }

          &__input {
            width: 100%;
            height: 100%;
          }

          &__form {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}


</style>

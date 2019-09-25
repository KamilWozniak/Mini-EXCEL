<template>
  <div class="app">
    <!--    {{valuesArray}}-->
    <div class="excel-container">
      <div class="excel-container__main-form">
        <form @submit.prevent="">
          <input class="main-form__input"
                 type="text"
                 v-model="mainInputQuery">

          <button class="main-form__btn">policz</button>
        </form>
      </div>
      <div class="excel-container__main-grid"
           :style="this.gridStyles">
        <div class="main-grid__empty-cell" />
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
             class="main-grid__cell">

          <form class="main-grid__cell__form"
                @submit.prevent="parseCellQuery(cell.row - 1, cell.column - 1)">

            <input type="text"
                   class="main-grid__cell__input"
                   :key="`r_${cell.row}_c_${cell.column}_input`"
                   v-model="valuesArray[cell.row - 1][cell.column - 1].insertedQuery"
                   @focus="displayCellQuery(cell.row - 1, cell.column - 1)">

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
  components: {},
  data() {
    return {
      gridColumns: 10,
      gridRows: 10,
      mainInputQuery: '',
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W'],
      valuesArray: [],
      handledOperations: ['SUM', 'MUL'],
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
  },
  methods: {
    createEmptyValuesArray() {
      for (let i = 0; i < this.gridRows; i += 1) {
        const oneRow = [];
        for (let j = 0; j < this.gridColumns; j += 1) {
          oneRow.push({
            value: '',
            insertedQuery: '',
          });
          if (j === this.gridColumns - 1) {
            this.valuesArray.push(oneRow);
          }
        }
      }
    },
    summate(operands) {
      let total = 0;
      const operandsArray = [...operands];
      console.log('adding');
      for (let i = 0; i < operandsArray.length; i += 1) {
        total += parseFloat(operandsArray[i]);
      }
      return total;
    },
    multiply(operands) {
      let total = 1;
      const operandsArray = [...operands];
      console.log('multiplying');
      for (let i = 0; i < operandsArray.length; i += 1) {
        total *= parseFloat(operandsArray[i]);
      }
      return total;
    },
    // checkIfSimpleOperands(operandsString) {
    //   let isSimple = true;
    //   this.handledOperations.forEach((operation) => {
    //     if (operandsString.includes(operation)) {
    //       isSimple = false;
    //     }
    //   });
    //   return isSimple;
    // },
    // separateComplexOperands(complexOperandsString) {
    //   const complexOperandsArray = [];
    //
    //   return complexOperandsArray;
    // },
    // simplifyOperands(operandsString) {
    //   let simplifiedOperands = [];
    //   if (this.checkIfSimpleOperands(operandsString)) {
    //     simplifiedOperands = operandsString.split(',');
    //     return simplifiedOperands;
    //   } else {
    //     console.log('not that simple');
    //
    //     // check if operands of that complex operation are simple
    //
    //
    //     // check what kind of operations need to be done
    //     // define operands for this operation
    //     // check if operands are simple
    //     // if yes -> make operation and return value
    //     // if not -> simplify operands
    //
    //   }
    //   // check if simple operands DONE
    //   // if yes -> return simplified operands DONE
    //   // if not -> simplify operands somehow
    //   // check if simple operands
    //   // if yes -> return simplified operands
    //   // if not -> recursively run simplifyOperands()
    //   return simplifiedOperands;
    // },
    extractRowAndColFromCellIndex(cellIndex) {
      const cellCoordinates = {
        row: 0,
        column: 0,
      };
      let numberStart = null;
      let colLetter = null;
      let rowNumber = null;
      let colNumber = null;

      for (let i = 0; i < cellIndex.length; i += 1) {
        if (cellIndex.charCodeAt(i) > 47 && cellIndex.charCodeAt(i) < 58) {
          numberStart = i;
          break;
        }
      }

      colLetter = cellIndex.slice(0, numberStart);
      rowNumber = cellIndex.slice(numberStart);
      cellCoordinates.row = rowNumber - 1;
      this.letters.forEach((letter, index) => {
        if (letter === colLetter) {
          colNumber = index;
        }
      });
      cellCoordinates.column = colNumber;
      return cellCoordinates;
    },
    defineRangeDirection(start, end) {
      if (start.column === end.column) {
        return 'VERTICAL';
      }
      if (start.row === end.row) {
        return 'HORIZONTAL';
      }
      return 'UNSPECIFIED';
    },
    parseOperands(operands) {
      const newOperands = [];

      operands.forEach((operand) => {
        if (operand.includes(':')) {
          const rangeOperands = operand.split(':');
          rangeOperands[0] = rangeOperands[0].trim();
          rangeOperands[1] = rangeOperands[1].trim();
          const startRange = this.extractRowAndColFromCellIndex(rangeOperands[0]);
          const endRange = this.extractRowAndColFromCellIndex(rangeOperands[1]);
          const direction = this.defineRangeDirection(startRange, endRange);

          if (direction === 'VERTICAL') {
            for (let i = startRange.row; i <= endRange.row; i += 1) {
              newOperands.push(this.valuesArray[i][startRange.column].value);
            }
          }
          if (direction === 'HORIZONTAL') {
            for (let i = startRange.column; i <= endRange.column; i += 1) {
              newOperands.push(this.valuesArray[startRange.row][i].value);
            }
          }
        } else {
          newOperands.push(parseFloat(operand));
        }
      });
      return newOperands;
    },
    parseCellQuery(row, col) {
      const cell = this.valuesArray[row][col];
      const cellQuery = cell.insertedQuery;

      if (cellQuery[0] === '=') {
        const operation = cellQuery.slice(1, 4);
        // const operandsString = cellQuery.slice(5, -1);
        const operands = this.parseOperands(cellQuery.slice(5, -1)
          .split(','));

        // if (this.checkIfSimpleOperands(operandsString)) {
        //   operands = operandsString.split(',');
        // } else {
        //   // operands = this.simplifyOperands(operandsString);
        //   // console.log('not that simple');
        //   // console.log(operandsString);
        // }

        switch (operation) {
          case 'SUM': {
            cell.value = this.summate(operands);
            console.log('cell: ', cell);
            break;
          }
          case 'MUL': {
            cell.value = this.multiply(operands);
            console.log('cell: ', cell);
            break;
          }
          default: {
            console.log('unknown operation!');
          }
        }
      } else {
        cell.value = cellQuery;
      }
    },
    displayCellQuery(row, col) {
      this.mainInputQuery = this.valuesArray[row][col].insertedQuery;
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
    width: 100rem;
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
      grid-gap: 3px;

      .main-grid {
        &__empty-cell {
          background-color: $cell-color;
        }

        &__column-letter {
          height: fit-content;

          &__wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: $cell-color;
          }
        }

        &__row-index {
          width: fit-content;

          &__wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: $cell-color;
          }
        }

        &__cell {
          background-color: lighten($cell-color, 10);

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

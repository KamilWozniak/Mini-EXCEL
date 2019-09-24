<template>
  <div class="app">
    <div class="excel-container">
      <div class="excel-container__main-form">
        <form @submit.prevent="">
          <input class="main-form__input"
                 type="text"
                 v-model="inputQuery">

          <button class="main-form__btn">policz</button>
        </form>
      </div>
      <div class="excel-container__main-grid">
        <div class="main-grid__empty-cell"/>
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

          <input type="text"
                 class="main-grid__cell__input"
                 v-model="valuesArray[cell.row - 1][cell.column -1]">
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'excel-app',
  components: {},
  data() {
    return {
      gridColumns: 10,
      gridRows: 10,
      inputQuery: '',
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W'],
      valuesArray: [],
    };
  },
  computed: {
    gridCells() {
      const cells = [];
      for (let i = 1; i <= this.gridRows; i += 1) {
        for (let j = 1; j <= this.gridColumns; j += 1) {
          cells.push({ column: j, row: i });
        }
      }
      return cells;
    },
  },
  created() {
    this.valuesArray = Array(this.gridRows).fill('').map(() => Array(this.gridColumns).fill(''));
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
      grid-template-columns: 3rem repeat(10, $cell-width);
      grid-template-rows: 3rem repeat(10, $cell-height);
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

          &__input{
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}


</style>

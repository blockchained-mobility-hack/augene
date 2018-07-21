export const LOADING = "LOADING";
export const ERROR = "ERROR";
export const LOADED = "LOADED";


export const loading = () => ({
  state: LOADING,
  value: null
});


export const error = msg => ({
  state: ERROR,
  value: msg,
});


export const loaded = data => ({
  state: LOADED,
  value: data,
});


export const map = ({state, value}, fn ) => {
  return {
    state,
    value: fn(value)
  }
}

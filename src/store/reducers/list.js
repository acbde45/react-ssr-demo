import { createSlice } from '@reduxjs/toolkit';

export const listSlice = createSlice({
  name: 'list',
  initialState: {
    loading: false,
    value: [],
  },
  reducers: {
    updateListState: (state, action) => {
      state.value = action.payload.value;
      state.loading = action.payload.loading;
    },
  },
});

export const { updateListState } = listSlice.actions;

export default listSlice.reducer;

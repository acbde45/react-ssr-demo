import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from '../../store/reducers/counter';

export default function Home() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>This is Home Page</h1>
      <div>
        <button onClick={() => dispatch(increment())}>
          +
        </button>
        <span> {count} </span>
        <button onClick={() => dispatch(decrement())}>
          -
        </button>
      </div>
    </div>
  );
}

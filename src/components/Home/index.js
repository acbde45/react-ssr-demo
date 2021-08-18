import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  decrement,
  increment,
  incrementByAmount,
} from '../../store/reducers/counter';

function Home() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>This is Home Page</h1>
      <div>
        <button onClick={() => dispatch(increment())}>+</button>
        <span> {count} </span>
        <button onClick={() => dispatch(decrement())}>-</button>
      </div>
    </div>
  );
}

Home.getInitialProps = (store) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      store.dispatch(incrementByAmount(10));
      resolve();
    });
  });
};

export default Home;

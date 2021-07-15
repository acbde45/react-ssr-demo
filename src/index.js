import React from 'react';
import ReactDOM from 'react-dom';

import s from './index.css';

console.log(s);

function Home() {
  const [count, setCount] = React.useState(0);

  function increase() {
    setCount(count + 1);
  }

  function decrease() {
    setCount(count - 1);
  }

  return (
    <div className={s.contianer}>
      <h1 className={s.title}>Hello world</h1>
      <button className={s.increaseBtn} onClick={increase}>+</button>
      <span className={s.count}>{count}</span>
      <button className={s.decreaseBtn} onClick={decrease}>-</button>
    </div>
  );
}

ReactDOM.hydrate(<Home />, document.getElementById('root'));

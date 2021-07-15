const React = require('react');

const s = require('./index.css');

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

module.exports = <Home />;


import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateListState } from '../../store/reducers/list';

function About() {
  const list = useSelector((state) => state.list);
  const dispatch = useDispatch();

  useEffect(() => {
    if (list.value.length !== 0) return;
    dispatch(
      updateListState({
        loading: true,
        value: [],
      })
    );
    setTimeout(() => {
      dispatch(
        updateListState({
          loading: false,
          value: ['躺', '平', '设', '计', '家'],
        })
      );
    }, 500);
  }, []);

  return (
    <div>
      <h1>This is About Page</h1>
      {list.loading ? (
        <p>Loading</p>
      ) : (
        <ul>
          {list.value.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

About.getInitialProps = (store) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      store.dispatch(
        updateListState({
          loading: false,
          value: ['躺', '平', '设', '计', '家'],
        })
      );
      resolve();
    });
  });
};

export default About;

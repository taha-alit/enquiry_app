import React from 'react';
import './home.scss';
import Header from '../../components/header/Header';

export default function Home() {
  return (
    <React.Fragment>
      <Header 
        hideDefaultButtons
      />
      <div className={'logos-container'}>
        <img src={`${process.env.PUBLIC_URL}/full_logo.svg`} />
      </div>
    </React.Fragment>
  )
}

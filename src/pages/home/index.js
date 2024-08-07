import React from 'react';
import './home.scss';

export default function Home() {
  return (
    <React.Fragment>
      <div className={'logos-container'}>
        <img src={`${process.env.PUBLIC_URL}/logo.svg`} style={{ height: '25%', width: '25%' }} />
        <div className='content'>
          Welcome to Enquiry Dashboard
        </div>
      </div>
    </React.Fragment>
  )
}

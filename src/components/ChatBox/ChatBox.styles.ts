import { css } from 'lit';

export const styles = css`
  :host {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    max-height: 80vh;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
  }
`;
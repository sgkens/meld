import { defineMeld, meldHtml, meldState } from '../../../src/meld.core.js';
import { store, actions } from '../store.js';

defineMeld('user-login', (el) => {
  const loginState = meldState({
    selectedUsername: '',
    pin: '',
    error: ''
  });

  const selectUser = (username) => {
    const user = store.users.find(u => u.username === username);
    if (user && !user.pin) {
      // Guest login has no PIN
      const res = actions.login(username, '');
      if (res.success) {
        // Logged in
      } else {
        loginState.error = res.error;
      }
    } else {
      loginState.selectedUsername = username;
      loginState.pin = '';
      loginState.error = '';
    }
  };

  const handlePinInput = (e) => {
    loginState.pin = e.target.value;
    if (loginState.pin.length === 4) {
      const res = actions.login(loginState.selectedUsername, loginState.pin);
      if (res.success) {
        // Successful login
      } else {
        loginState.error = res.error;
        loginState.pin = '';
      }
    }
  };

  const backToUsers = () => {
    loginState.selectedUsername = '';
    loginState.pin = '';
    loginState.error = '';
  };

  return meldHtml`
    <style>
      :host {
        display: flex;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .login-box {
        background: rgba(30, 41, 59, 0.45);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        padding: 40px;
        width: 100%;
        max-width: 440px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.4s var(--mui-ease) forwards;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .logo {
        width: 60px;
        height: 60px;
        margin-bottom: var(--mui-space-4);
        animation: rotate 6s linear infinite;
      }

      @keyframes rotate {
        100% { transform: rotate(360deg); }
      }

      .title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 8px 0;
        background: linear-gradient(135deg, var(--mui-primary), #fbbf24);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        color: #94a3b8;
        font-size: 0.95rem;
        margin-bottom: var(--mui-space-8);
      }

      .user-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .user-card {
        display: flex;
        align-items: center;
        gap: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 16px 20px;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.25s var(--mui-ease);
        text-align: left;
      }

      .user-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--mui-primary);
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }

      .avatar {
        font-size: 1.75rem;
        background: rgba(255, 255, 255, 0.06);
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .user-info {
        flex: 1;
      }

      .user-name {
        font-weight: 600;
        font-size: 0.975rem;
        color: #f8fafc;
      }

      .user-role {
        font-size: 0.8rem;
        color: #94a3b8;
        text-transform: capitalize;
        margin-top: 2px;
      }

      .pin-screen {
        animation: fadeIn 0.25s var(--mui-ease) forwards;
      }

      .pin-dots {
        display: flex;
        justify-content: center;
        gap: var(--mui-space-4);
        margin: var(--mui-space-6) 0;
      }

      .pin-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        transition: all 0.2s;
      }

      .pin-dot.filled {
        background: var(--mui-primary);
        box-shadow: 0 0 10px var(--mui-primary);
      }

      .hidden-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      .pin-hint {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: var(--mui-space-6);
      }

      .error-msg {
        color: #f87171;
        font-size: 0.85rem;
        margin-bottom: var(--mui-space-4);
        animation: shake 0.3s ease;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }

      .back-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #e2e8f0;
        padding: 8px 20px;
        border-radius: 9999px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .back-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: #f8fafc;
      }
    </style>

    <div class="login-box">
      <img src="../logo.svg" class="logo" alt="Meld Logo" />
      <h1 class="title">Meld TaskFlow</h1>
      <p class="subtitle">Secure workspace orchestrator</p>

      ${() => !loginState.selectedUsername ? meldHtml`
        <div class="user-list">
          ${() => store.users.map(u => meldHtml`
            <div class="user-card" onclick="${() => selectUser(u.username)}">
              <div class="avatar">${u.avatar}</div>
              <div class="user-info">
                <div class="user-name">${u.name}</div>
                <div class="user-role">${u.role}</div>
              </div>
              <div style="font-size:0.85rem; color:#64748b;">🔑</div>
            </div>
          `)}
        </div>
      ` : meldHtml`
        <div class="pin-screen">
          <div class="avatar" style="margin: 0 auto 16px auto;">
            ${() => store.users.find(u => u.username === loginState.selectedUsername)?.avatar}
          </div>
          <div class="user-name" style="font-size:1.1rem; margin-bottom:4px;">
            ${() => store.users.find(u => u.username === loginState.selectedUsername)?.name}
          </div>
          <div class="user-role" style="margin-bottom:20px;">
            ${() => store.users.find(u => u.username === loginState.selectedUsername)?.role}
          </div>

          ${() => loginState.error ? meldHtml`<div class="error-msg">${loginState.error}</div>` : ''}

          <div class="pin-hint">Enter your 4-digit PIN to gain access</div>

          <div class="pin-dots" onclick="${() => { el.shadowRoot.getElementById('pin-input')?.focus(); }}">
            <div class="pin-dot ${() => loginState.pin.length >= 1 ? 'filled' : ''}"></div>
            <div class="pin-dot ${() => loginState.pin.length >= 2 ? 'filled' : ''}"></div>
            <div class="pin-dot ${() => loginState.pin.length >= 3 ? 'filled' : ''}"></div>
            <div class="pin-dot ${() => loginState.pin.length >= 4 ? 'filled' : ''}"></div>
          </div>

          <input 
            type="password" 
            id="pin-input"
            class="hidden-input" 
            maxlength="4"
            pattern="[0-9]*"
            inputmode="numeric"
            autofocus
            value="${() => loginState.pin}"
            oninput="${handlePinInput}"
          />

          <div class="pin-hint" style="font-style:italic;">Hint: Admin PIN is 1234, Developer is 0000</div>

          <button class="back-btn" onclick="${backToUsers}">Change User</button>
        </div>
      `}
    </div>
  `;
});

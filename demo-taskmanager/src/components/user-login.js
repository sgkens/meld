import { defineMeld, meldHtml, meldState } from '../../../src/meld.core.js';
import { store, actions } from '../store.js';

defineMeld('user-login', () => {
  const loginState = meldState({
    username: '',
    password: '',
    error: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginState.error = '';
    const res = actions.login(loginState.username, loginState.password);
    if (res.success) {
      // Successful login updates store.currentUser, switching view reactively
    } else {
      loginState.error = res.error;
    }
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
        max-width: 400px;
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

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: left;
        margin-bottom: var(--mui-space-4);
      }

      .form-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .form-input {
        padding: 12px 16px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        color: #f8fafc;
        font-size: 0.95rem;
        transition: all 0.2s;
        font-family: var(--mui-font);
      }

      .form-input:focus {
        outline: none;
        border-color: var(--mui-primary);
        box-shadow: 0 0 8px color-mix(in srgb, var(--mui-primary) 30%, transparent);
        background: rgba(15, 23, 42, 0.8);
      }

      .submit-btn {
        width: 100%;
        padding: 12px;
        background: var(--mui-primary);
        color: var(--mui-primary-fg);
        border: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 10px;
        box-shadow: 0 4px 12px color-mix(in srgb, var(--mui-primary) 20%, transparent);
      }

      .submit-btn:hover {
        background: var(--mui-primary-hover);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px color-mix(in srgb, var(--mui-primary) 30%, transparent);
      }

      .error-msg {
        color: #f87171;
        font-size: 0.85rem;
        margin-bottom: var(--mui-space-4);
        text-align: left;
        animation: shake 0.3s ease;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }

      .hint-box {
        margin-top: 25px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 12px;
        padding: 12px;
        font-size: 0.78rem;
        color: #64748b;
        line-height: 1.5;
        text-align: left;
      }
    </style>

    <div class="login-box">
      <img src="../logo.svg" class="logo" alt="Meld Logo" />
      <h1 class="title">Meld TaskFlow</h1>
      <p class="subtitle">Secure workspace orchestrator</p>

      <form onsubmit="${handleSubmit}">
        ${() => loginState.error ? meldHtml`<div class="error-msg">⚠️ ${loginState.error}</div>` : ''}

        <div class="form-group">
          <label class="form-label">Username</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="e.g. admin or developer"
            required
            value="${() => loginState.username}"
            oninput="${(e) => { loginState.username = e.target.value; }}"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input 
            type="password" 
            class="form-input" 
            placeholder="••••••••"
            value="${() => loginState.password}"
            oninput="${(e) => { loginState.password = e.target.value; }}"
          />
        </div>

        <button type="submit" class="submit-btn">Sign In</button>
      </form>

      <div class="hint-box">
        <strong>Demo Accounts (user / password):</strong><br/>
        • 🛡️ admin / admin <br/>
        • 💻 developer / dev <br/>
        • 👀 guest / (leave blank)
      </div>
    </div>
  `;
});

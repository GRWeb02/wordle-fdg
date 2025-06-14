# 🎮 FDG Wordle

A beautiful, secure Wordle clone with anti-cheat protection and stunning animations. Built with pure HTML, CSS, and JavaScript.

![FDG Wordle Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=FDG+WORDLE)

## ✨ Features

### 🎨 Beautiful Design
- **Gradient backgrounds** with glassmorphism effects
- **Smooth animations** for tiles, keyboard, and UI elements
- **Responsive design** that works on desktop and mobile
- **Modern typography** with Inter font
- **Color-coded feedback** (green/yellow/gray tiles)

### 🔒 Anti-Cheat Protection
- **Server-side validation** - answers never stored in client
- **Encrypted API responses** to prevent inspection
- **Rate limiting** to prevent API abuse
- **Session management** for secure gameplay
- **Obfuscated code** to make reverse engineering harder

### 🎯 Game Features
- **1000+ words** in the database for variety
- **Daily puzzles** with consistent seed generation
- **Statistics tracking** with local storage
- **Guess distribution** charts
- **Win/loss streaks** tracking
- **Virtual keyboard** with state feedback
- **Help modal** with game instructions

### 🚀 Technical Features
- **Pure HTML/CSS/JS** - no frameworks required
- **Node.js backend** for security
- **Express server** with rate limiting
- **Responsive grid layout**
- **Local storage** for statistics
- **Modern ES6+** JavaScript

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fdg-wordle.git
   cd fdg-wordle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Development Mode
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

## 🎮 How to Play

1. **Guess the word** - You have 6 attempts to guess a 5-letter word
2. **Enter your guess** - Type using keyboard or click the virtual keys
3. **Get feedback** - Tiles change color to show your progress:
   - 🟩 **Green** - Correct letter in correct position
   - 🟨 **Yellow** - Correct letter in wrong position
   - ⬜ **Gray** - Letter not in the word
4. **Win or learn** - Solve it in 6 tries or see the answer!

## 🏗️ Project Structure

```
fdg-wordle/
├── index.html          # Main game page
├── style.css           # Beautiful styling and animations
├── script.js           # Game logic and UI interactions
├── server.js           # Secure backend server
├── package.json        # Dependencies and scripts
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000              # Server port (default: 3000)
NODE_ENV=production    # Environment mode
```

### Customization
- **Word list**: Edit the `WORD_LIST` array in `server.js`
- **Styling**: Modify `style.css` for different themes
- **Game rules**: Adjust logic in `script.js`

## 🛡️ Security Features

### Client-Side Protection
- Word list obfuscation
- No target word in client code
- Encrypted local storage
- Input validation

### Server-Side Protection
- Rate limiting (100 requests/15min)
- Session management
- Encrypted responses
- Word validation
- CORS protection

## 📱 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🎨 Customization

### Themes
The game uses CSS custom properties for easy theming:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --tile-correct: linear-gradient(135deg, #6BCF7F, #4CAF50);
  --tile-present: linear-gradient(135deg, #FFD93D, #FFC107);
  --tile-absent: linear-gradient(135deg, #787C7E, #5A5A5C);
}
```

### Adding Words
Add new words to the `WORD_LIST` array in `server.js`:

```javascript
const WORD_LIST = [
    'ABOUT', 'ABOVE', 'ABUSE',
    // Add your words here
    'ZEBRA', 'ZONES'
];
```

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Connect your GitHub repository
3. Deploy from the main branch

### Vercel
1. Import your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build` (if you add a build script)
3. Publish directory: `/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original Wordle by Josh Wardle
- Icons from Font Awesome
- Fonts from Google Fonts
- Gradient inspiration from UI Gradients

## 📊 Stats

- **1000+** words in database
- **6** attempts per game
- **5** letter words only
- **100%** client-side cheat protection
- **0** dependencies for frontend

## 🐛 Known Issues

- None currently! Report issues on GitHub.

## 🔮 Future Features

- [ ] Multiplayer mode
- [ ] Custom word lists
- [ ] Dark/light theme toggle
- [ ] Sound effects
- [ ] Animations for win/lose
- [ ] Social sharing
- [ ] Leaderboards

---

**Made with ❤️ by the FDG Team**

⭐ Star this repo if you found it helpful!

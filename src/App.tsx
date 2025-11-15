import MusicPlayer from './components/MusicPlayer'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="upload-instructions">
        <h1 style={{ textAlign: 'center', color: 'white', padding: '20px' }}>音乐播放器</h1>
        <p style={{ textAlign: 'center', color: '#ccc', padding: '0 20px 20px 20px' }}>
          欢迎使用音乐播放器！您可以通过以下方式导入本地音乐文件进行播放：
        </p>
        <ul style={{ textAlign: 'center', color: '#ccc', maxWidth: '600px', margin: '0 auto 20px auto', padding: '0 20px' }}>
          <li style={{ marginBottom: '10px' }}>• 点击播放列表右上角的"+"按钮添加单个或多个音乐文件</li>
          <li style={{ marginBottom: '10px' }}>• 点击播放列表右上角的文件夹图标添加整个文件夹的音乐</li>
          <li>• 支持iOS和Android浏览器打开本地音乐文件</li>
        </ul>
      </header>
      <MusicPlayer />
    </div>
  )
}

export default App
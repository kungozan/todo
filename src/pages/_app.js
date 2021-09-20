import { useState, useMemo, useEffect } from 'react'
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery
} from '@mui/material'
import { Menu, FlashOn, FlashOff } from '@mui/icons-material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

export default function MyApp({ Component, pageProps }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light')

  useEffect(() => {
    setMode(prefersDarkMode ? 'dark' : 'light')
  }, [prefersDarkMode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode
        }
      }),
    [mode]
  )

  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light')

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo
          </Typography>
          <IconButton color="inherit" onClick={toggleMode}>
            {mode === 'light' ? <FlashOn /> : <FlashOff />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Component {...pageProps} />
      <CssBaseline />
    </ThemeProvider>
  )
}

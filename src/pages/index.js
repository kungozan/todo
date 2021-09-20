import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Container,
  Stack,
  Typography,
  Paper,
  Box,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  TextField,
  Fab,
  Button,
  InputBase,
  Skeleton,
  SwipeableDrawer
} from '@mui/material'
import {
  Add,
  Clear,
  Edit,
  Done,
  Celebration,
  Whatshot,
  PendingActions
} from '@mui/icons-material'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { nanoid } from 'nanoid'
import { get, set } from 'idb-keyval'

const DragDropContextNoSSR = dynamic(
  () => import('react-beautiful-dnd').then((module) => module.DragDropContext),
  {
    ssr: false
  }
)

export default function Home() {
  const [loadingTodos, setLoadingTodos] = useState(true)
  const [todos, setTodos] = useState([])
  const [newTodoDescription, setNewTodoDescription] = useState('')
  const [addingNewTodoDescription, setAddingNewTodoDescription] =
    useState(false)
  const [filter, setFilter] = useState('all')
  const [placeholderProps, setPlaceholderProps] = useState({})

  useEffect(() => {
    ;(async function getStoredTodos() {
      const storedTodos = await get('todos')

      if (Array.isArray(storedTodos)) {
        setTodos(storedTodos)
      }

      setLoadingTodos(false)
    })()
  }, [])

  useEffect(() => {
    ;(async function setStoredTodos(todos) {
      await set('todos', todos)
    })(todos)
  }, [todos])

  const filteredTodos = useMemo(
    () =>
      todos.filter(({ completed }) => {
        switch (filter) {
          case 'completed':
            return completed
          case 'active':
            return !completed
          case 'all':
          default:
            return true
        }
      }),
    [todos, filter]
  )

  const addTodo = (event) => {
    event.preventDefault()

    if (newTodoDescription === '') {
      return
    }

    const updatedTodos = [...todos]

    updatedTodos.unshift({
      id: nanoid(),
      description: newTodoDescription,
      completed: false
    })

    setTodos(updatedTodos)
    setNewTodoDescription('')
  }

  const updateTodo = (id, updatedTodo) => {
    const updatedTodos = [...todos]
    const todoIndex = updatedTodos.findIndex((todo) => todo.id === id)

    updatedTodos[todoIndex] = updatedTodo

    setTodos(updatedTodos)
  }

  const removeTodo = (id) => {
    const updatedTodos = [...todos]
    const todoIndex = updatedTodos.findIndex((todo) => todo.id === id)

    updatedTodos.splice(todoIndex, 1)

    setTodos(updatedTodos)
  }

  const updateNewTodoDescription = (event) =>
    setNewTodoDescription(event.target.value)

  const updateFilter = (_, updatedFilter) => {
    if (updatedFilter) setFilter(updatedFilter)
  }

  const onDragEnd = ({ destination, source }) => {
    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const updatedTodos = [...todos]
    updatedTodos.splice(source.index, 1)
    updatedTodos.splice(destination.index, 0, todos[source.index])
    setTodos(updatedTodos)
    setPlaceholderProps({})
  }

  const onDragUpdate = (update) => {
    if (!update.destination) {
      setPlaceholderProps({})

      return
    }

    const draggableId = update.draggableId
    const destinationIndex = update.destination.index
    const domQuery = `[data-rbd-drag-handle-draggable-id='${draggableId}']`
    const draggedDOM = document.querySelector(domQuery)

    if (!draggedDOM) {
      setPlaceholderProps({})

      return
    }

    const { offsetHeight, offsetWidth } = draggedDOM

    const clientY =
      parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingTop) +
      [...draggedDOM.parentNode.children]
        .slice(0, destinationIndex)
        .reduce((total, curr) => {
          const style = curr.currentStyle || window.getComputedStyle(curr)
          const marginTop = parseFloat(style.marginTop)

          return total + curr.offsetHeight + marginTop
        }, 0)

    setPlaceholderProps({
      top: clientY,
      left: parseFloat(
        window.getComputedStyle(draggedDOM.parentNode).paddingLeft
      ),
      width: offsetWidth,
      height: offsetHeight
    })
  }

  return (
    <main>
      <Container>
        <ToggleButtonGroup
          value={filter}
          onChange={updateFilter}
          exclusive
          fullWidth
          sx={{ mt: 4, mb: 4 }}
        >
          <ToggleButton value="all" variant="text">
            All
          </ToggleButton>
          <ToggleButton value="active" variant="text">
            Active
          </ToggleButton>
          <ToggleButton value="completed" variant="text">
            Completed
          </ToggleButton>
        </ToggleButtonGroup>

        {Array.isArray(filteredTodos) && filteredTodos.length ? (
          <DragDropContextNoSSR
            onDragEnd={onDragEnd}
            onDragUpdate={onDragUpdate}
          >
            <Droppable droppableId="todo-list">
              {(provided) => (
                <Stack
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  spacing={2}
                  sx={{ position: 'relative', mb: 13 }}
                >
                  {filteredTodos.map((todo, todoIndex) => {
                    const {
                      id,
                      description,
                      editedDescription,
                      completed,
                      editing
                    } = todo

                    return (
                      <Draggable
                        key={id}
                        draggableId={description}
                        index={todoIndex}
                      >
                        {(provided, snapshot) => (
                          <Paper
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            elevation={snapshot.isDragging || editing ? 4 : 1}
                          >
                            <Box
                              sx={{
                                p: 1,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Checkbox
                                checked={completed}
                                onChange={() =>
                                  updateTodo(id, {
                                    ...todo,
                                    completed: !completed
                                  })
                                }
                              />
                              {editing ? (
                                <form
                                  style={{ width: '100%' }}
                                  onSubmit={(event) => {
                                    event.preventDefault()

                                    updateTodo(id, {
                                      ...todo,
                                      editing: false,
                                      description: editedDescription
                                    })
                                  }}
                                >
                                  <InputBase
                                    fullWidth
                                    autoFocus
                                    value={editedDescription}
                                    onChange={(event) =>
                                      updateTodo(id, {
                                        ...todo,
                                        editedDescription: event.target.value
                                      })
                                    }
                                    onFocus={() =>
                                      updateTodo(id, {
                                        ...todo,
                                        editedDescription: description
                                      })
                                    }
                                    onBlur={() =>
                                      updateTodo(id, {
                                        ...todo,
                                        editing: false,
                                        editedDescription: ''
                                      })
                                    }
                                  />
                                </form>
                              ) : (
                                <Typography
                                  noWrap
                                  sx={{
                                    color: (theme) =>
                                      completed
                                        ? theme.palette.text.disabled
                                        : '',
                                    textDecoration: completed
                                      ? 'line-through'
                                      : ''
                                  }}
                                >
                                  {description}
                                </Typography>
                              )}
                              <IconButton
                                sx={{ ml: 'auto' }}
                                onClick={() =>
                                  updateTodo(id, {
                                    ...todo,
                                    editing: !editing,
                                    description: editing
                                      ? editedDescription
                                      : description
                                  })
                                }
                              >
                                {editing ? <Done /> : <Edit />}
                              </IconButton>
                              <IconButton onClick={() => removeTodo(id)}>
                                <Clear />
                              </IconButton>
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                  <Paper
                    variant="outlined"
                    sx={{
                      ...placeholderProps,
                      position: 'absolute',
                      zIndex: -1
                    }}
                  />
                </Stack>
              )}
            </Droppable>
          </DragDropContextNoSSR>
        ) : loadingTodos ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            {Array.isArray(todos) && todos.length === 0 ? (
              <>
                <Whatshot fontSize="large" />
                <Typography sx={{ mb: 1 }} variant="h5">
                  Let&apos;s get started!
                </Typography>
                <Typography sx={{ mb: 1 }} variant="body1">
                  Don&apos;t tell me you have nothing to do.
                </Typography>
                <Button onClick={() => setAddingNewTodoDescription(true)}>
                  Create your first todo
                </Button>
              </>
            ) : filter === 'active' ? (
              <>
                <Celebration fontSize="large" />
                <Typography sx={{ mb: 1 }} variant="h5">
                  Congratulations!
                </Typography>
                <Typography variant="body1">
                  You have finished all your tasks.
                </Typography>
              </>
            ) : (
              <>
                <PendingActions fontSize="large" />
                <Typography sx={{ mb: 1 }} variant="h5">
                  What are you doing?
                </Typography>
                <Typography variant="body1">
                  You haven&apos;t completed any tasks yet...
                </Typography>
              </>
            )}
          </Box>
        )}
      </Container>

      <Fab
        sx={{
          position: 'fixed',
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
          zIndex: 1000
        }}
        onClick={() => setAddingNewTodoDescription(true)}
        color="primary"
      >
        <Add />
      </Fab>

      <SwipeableDrawer
        anchor="bottom"
        open={addingNewTodoDescription}
        onClose={() => setAddingNewTodoDescription(false)}
        onOpen={() => setAddingNewTodoDescription(true)}
      >
        <form onSubmit={addTodo}>
          <TextField
            autoFocus
            fullWidth
            inputProps={{ enterKeyHint: 'done' }}
            value={newTodoDescription}
            onChange={updateNewTodoDescription}
            variant="filled"
            label="Add new todo"
          />
        </form>
      </SwipeableDrawer>
    </main>
  )
}

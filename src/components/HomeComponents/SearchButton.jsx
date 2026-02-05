import React from 'react'
import { TextField, InputAdornment, IconButton, Button, Box } from '@mui/material'
import { Camera } from 'lucide-react'


const SearchButton = () => {
    return (
        <Box sx={{ display: 'flex', gap: 2, width: '100%', border: '1px solid green' }}>
            <TextField
                size="small"
                placeholder="Search"
                sx={{
                    width: '80%',
                    border: '1px solid red',
                    bgcolor: 'search.backgroundColor',
                    borderRadius: 7,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            border: 'none',
                        },
                        '&:hover fieldset': {
                            border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                            border: 'none',
                        },
                    },
                    '& .MuiOutlinedInput-input::placeholder': {
                        color: 'text.main',
                        opacity: 1,
                    },
                }}
                InputProps={{
                    sx: {
                        color: 'text.main',
                    },
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton size="small" sx={{ p: 0 }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton sx={{ color: 'text.main', p: 0 }} size="small">
                                <Camera size={25} />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                sx={{
                    borderRadius: 7,
                    typography: 'button',
                    fontWeight: 500,
                    letterSpacing: '0.05rem',
                    textTransform: 'none',
                }}
                variant='contained'
            >
                Create
            </Button>
        </Box>
    )
}

export default SearchButton
import React from 'react'
import { Avatar, Box, Paper } from "@mui/material"
import SearchButton from './SearchButton'


const MainContent = () => {
    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar>J</Avatar>
                    <SearchButton />
                </Box>

            </Paper>
        </Box>
    )
}

export default MainContent
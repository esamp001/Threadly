import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, FormControl, MenuItem, Paper, Select, Typography } from "@mui/material";
import SearchButton from './SearchButton';


// Quill
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';

const ReactQuill = Quill;

console.log(ReactQuill, "ReactQuill");

const MainContent = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);

  useEffect(() => {
    if (isExpanded && quillRef.current && !quillInstanceRef.current) {
      // Initialize Quill when accordion expands
      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Write your post...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            ['clean']
          ]
        }
      });
    }
  }, [isExpanded]);


  // Function to get content
  // const getQuillContent = () => {
  //   if (quillInstanceRef.current) {
  //     return quillInstanceRef.current.root.innerHTML;
  //   }
  //   return '';
  // };


  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Accordion expanded={isExpanded}>
        <AccordionSummary onClick={(e) => e.stopPropagation()} sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Avatar sx={{ height: 50, width: 50 }}>J</Avatar>
            <SearchButton onExpand={() => setIsExpanded(!isExpanded)} />
          </Box>
        </AccordionSummary>

        {/* Select Spaces using dropdown */}
        <Box sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
          <FormControl fullWidth>
            <Select
              value={1}
              renderValue={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>T</Avatar>
                  <Typography fontWeight={700}>Tanong PH</Typography>
                </Box>
              )}
              sx={{ borderRadius: 5 }}
            >
              <MenuItem value={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28 }}>T</Avatar>
                  Tanong PH
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

        </Box>
        <AccordionDetails sx={{ p: 2, backgroundColor: 'paper.backgroundColor' }}>
          <Box
            sx={{
              width: '100%',
              '& .ql-container': {
                backgroundColor: 'paper.backgroundColor',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontFamily: 'Inter, Roboto, sans-serif',
              },
              '& .ql-editor': {
                backgroundColor: 'paper.backgroundColor',
                color: 'text.primary',
                fontSize: '16px',
                lineHeight: 1.5,
                padding: '16px',
                minHeight: '118px', // 150px - 32px padding
              },
              '& .ql-editor.ql-blank::before': {
                color: 'text.secondary',
              },
              '& .ql-toolbar': {
                backgroundColor: 'paper.backgroundColor',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px 12px 0 0',
              },
              '& .ql-stroke': {
                stroke: 'text.secondary !important',
              },
              '& .ql-fill': {
                fill: 'text.secondary !important',
              },
              '& .ql-picker-label': {
                color: 'text.secondary !important',
              },
              '& .ql-picker-options': {
                backgroundColor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              '& .ql-picker-item': {
                color: 'text.primary',
              },
              '& .ql-picker-item:hover': {
                backgroundColor: 'primary.main',
                color: 'text.primary',
              },
              '& .ql-picker-item.ql-selected': {
                backgroundColor: 'primary.main',
                color: 'text.primary',
              },
              '& .ql-snow .ql-picker.ql-expanded .ql-picker-label': {
                borderColor: 'primary.main',
              },
              '& .ql-snow .ql-picker.ql-expanded .ql-picker-options': {
                borderColor: 'primary.main'
              }
            }
            }
          >
            <div
              ref={quillRef}
              style={{ height: '150px', marginBottom: '50px' }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Thread Content */}
      <Paper sx={{ p: 2.5, backgroundColor: 'paper.backgroundColor', mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ height: 35, width: 35, mr: 1 }}>T</Avatar>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Tanong PH</Typography>
              <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>Posted by u/John Doe</Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>1 day ago</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, mt: 1 }}>Bakit hindi na ako mahal ng jowa ko?</Typography>

        {/* Actual Content */}
        <Box sx={{ mt: 2, border: '1px solid red', height: '100px' }}>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExpandLessRoundedIcon sx={{ color: 'primary.main', height: 30, width: 30 }} /> {/* Upvote */}
              <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>500</Typography>
            </Box>
            <ExpandMoreRoundedIcon sx={{ color: 'error.main', height: 30, width: 30 }} />{/* Downvote */}
          </Box>
          <Box sx={{ gap: 1, display: 'flex' }}>
            <Button sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }} variant='contained' startIcon={<MessageRoundedIcon sx={{ color: 'text.secondary' }} />}>
              <Typography sx={{ color: 'text.secondary' }}>500</Typography>
            </Button>
            <Button sx={{ borderRadius: 7, backgroundColor: 'button.backgroundColor' }} variant='contained' startIcon={<ReplyRoundedIcon sx={{ color: 'text.secondary' }} />}>
              <Typography sx={{ color: 'text.secondary' }}>26</Typography>
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default MainContent

import { Box } from '@mui/material';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef } from 'react';

const QuillEditor = ({ value, onChange, placeholder, height = '150px', isExpanded = false }) => {
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const onChangeRef = useRef(onChange);

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Handle text changes using ref for stable 
  const handleTextChange = () => {

    if (quillInstanceRef.current) {
      const htmlContent = quillInstanceRef.current.root.innerHTML;
      onChangeRef.current?.(htmlContent);
    }
  };

  useEffect(() => {
    if (!quillRef.current) {
      return;
    }

    // Initialize Quill
    if (isExpanded && quillRef.current && !quillInstanceRef.current) {
      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Share your thoughts...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      // Set initial value
      if (value) {
        quillInstanceRef.current.root.innerHTML = value;
      }

      // Handle text changes
      quillInstanceRef.current.on('text-change', handleTextChange);
    } else if (isExpanded && quillInstanceRef.current) {
      quillInstanceRef.current.on('text-change', handleTextChange);
    }

    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off('text-change', handleTextChange);
      }
    };
  }, [isExpanded, placeholder]);

  return (
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
          backgroundColor: 'primary.light',
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
        },
        '& .ql-snow.ql-toolbar button:hover, & .ql-snow.ql-toolbar button:focus, & .ql-snow.ql-toolbar button.ql-active, & .ql-snow.ql-toolbar .ql-picker-label:hover, & .ql-snow.ql-toolbar .ql-picker-label.ql-active, & .ql-snow.ql-toolbar .ql-picker-item:hover, & .ql-snow.ql-toolbar .ql-picker-item.ql-selected': {
          color: '#FFFFFF'
        },
        '& .ql-snow.ql-toolbar button:hover .ql-stroke, & .ql-snow.ql-toolbar button:focus .ql-stroke, & .ql-snow.ql-toolbar button.ql-active .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, & .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke': {
          stroke: '#FFFFFF !important',
        },
        '& .ql-snow.ql-toolbar button:hover .ql-fill, & .ql-snow.ql-toolbar button:focus .ql-fill, & .ql-snow.ql-toolbar button.ql-active .ql-fill, & .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, & .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, & .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, & .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill': {
          fill: '#FFFFFF !important',
        },
      }}
    >
      <div
        ref={quillRef}
        style={{ height, marginBottom: '50px' }}
      />
    </Box>
  );
};

export default QuillEditor;

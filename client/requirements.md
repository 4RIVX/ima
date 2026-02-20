## Packages
recharts | Dashboard analytics charts (Pie, Line)
framer-motion | Smooth page transitions and UI animations
react-dropzone | Drag and drop file upload area
lucide-react | Icons (already in base, but listing for clarity)
clsx | Class name utility (already in base)
tailwind-merge | Class name merging (already in base)

## Notes
- Authentication uses cookie-based sessions (credentials: "include")
- Analysis is simulated on backend; frontend sends file metadata/url
- Dashboard requires aggregation of analysis data (done on client for MVP or server if specified, assuming client aggregation based on list endpoint for now)
- PDF export will be implemented as a browser print style or simple CSV export

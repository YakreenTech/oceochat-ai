# OceoChat Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_pro_api_key
GEMINI_MODEL=gemini-pro

# Ocean Data APIs (All Free/Open APIs)
ARGO_API_BASE_URL=https://argo.ucsd.edu/argovis/api/v1/
NOAA_API_KEY=
NASA_OCEAN_COLOR_KEY=
COPERNICUS_API_KEY=
INCOIS_API_URL=http://incois.gov.in/portal/datainfo/index.jsp

# Research Platform Features
ENABLE_3D_VISUALIZATIONS=true
ENABLE_NETCDF_EXPORT=true
ENABLE_RESEARCH_REPORTS=true
MAX_EXPORT_SIZE_MB=100

# File Storage (for research downloads)
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Citation and DOI services
CROSSREF_API_KEY=
ORCID_CLIENT_ID=

# App Settings
NEXTAUTH_SECRET=dev_secret
NEXTAUTH_URL=http://localhost:3000
```

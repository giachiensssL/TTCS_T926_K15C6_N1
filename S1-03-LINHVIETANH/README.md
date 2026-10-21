# S1-03-LINHVIETANH

Authentication project containing an ASP.NET Core backend and an HTML/CSS/JavaScript frontend.

## Backend configuration

`Backend/appsettings.example.json` documents the configuration keys without including credentials. Set the required values through environment variables before running the backend:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Secret`
- `Email__Host`
- `Email__Port`
- `Email__Username`
- `Email__Password`
- `Email__FromEmail`

ASP.NET Core maps double underscores in environment-variable names to configuration sections. Keep real credentials in local, untracked configuration; do not commit `appsettings.json`, `appsettings.Development.json`, or `.env` files.

Build the backend from the `Backend` directory with `dotnet build`.

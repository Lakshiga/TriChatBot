var builder = WebApplication.CreateBuilder(args);

// 1. Add services to use controllers
builder.Services.AddControllers();

// (Optional but Recommended) Add Swagger to test the API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Policy to allow requests from React Native App
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactNativeApp",
        builder =>
        {
            // Allow all origins for development - you should restrict this in production
            builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .WithExposedHeaders("X-Total-Count"); // Expose custom headers if needed
        });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 2. Use the CORS policy we created
app.UseCors("AllowReactNativeApp");

// 3. Add this line to handle routing to controllers
app.MapControllers();

// Add this to see the actual URL where the API is running
var urls = string.Join(", ", app.Urls);
app.Logger.LogInformation($"API is running at: {urls}");

app.Run();
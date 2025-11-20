#r "nuget: BCrypt.Net-Next, 4.0.3"
using System;

var password = Environment.GetEnvironmentVariable("PWD_TO_HASH") ?? "admin";
var hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine(hash);
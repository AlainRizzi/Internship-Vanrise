using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http;
using Task6.Models;

namespace Task6.Controllers
{
    public class LoginController : ApiController
    {
        private readonly string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        [HttpPost]
        [Route("api/login/authenticate")]
        public IHttpActionResult Login([FromBody] LoginRequest model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest("Username and password are required.");
            }

            string hash = ComputeSha256Hash(model.Password);

            System.Diagnostics.Debug.WriteLine($"Login attempt: {model.Username} -> {hash}");

            using (var conn = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("ValidateUserLogin", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Username", model.Username);
                cmd.Parameters.AddWithValue("@PasswordHash", hash);

                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        int userId = (int)reader["ID"];
                        string username = reader["Username"].ToString();

                        return Ok(new
                        {
                            success = true,
                            message = "Login successful",
                            userId,
                            username
                        });
                    }
                    else
                    {
                        return Content(HttpStatusCode.Unauthorized, new
                        {
                            success = false,
                            message = "Invalid username or password."
                        });
                    }
                }
            }
        }

        private string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(rawData);
                byte[] hashBytes = sha256.ComputeHash(bytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
    }
}
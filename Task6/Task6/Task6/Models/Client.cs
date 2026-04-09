using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting;
using System.Web;

namespace Task6.Models
{
    public class Client
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public ClientType Type { get; set; }
        public DateTime? BirthDate { get; set; }
    }

    public enum ClientType
    {
        Individual = 0,
        Organization = 1
    }
}
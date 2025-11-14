package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/signup")
public class Singup extends HttpServlet{
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		PrintWriter pw=res.getWriter();
		res.setContentType("text/html");
		String fName=req.getParameter("firstName");
		String lName=req.getParameter("lastName");
		String regNo=req.getParameter("regNo").toUpperCase();
		String branch=req.getParameter("branch");
		String email=req.getParameter("email");
		String phone=req.getParameter("phone");
		String username=req.getParameter("username").toUpperCase();
		String password=req.getParameter("password");
		String role="user";
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
			PreparedStatement ps=con.prepareStatement("INSERT INTO USER_STUDENTS VALUES(?,?,?,?,?,?)");
			PreparedStatement ps1=con.prepareStatement("INSERT INTO USERS VALUES(?,?,?)");
			ps.setString(1, regNo);
			ps.setString(2, fName);
			ps.setString(3, lName);
			ps.setString(4, email);
			ps.setString(5, phone);
			ps.setString(6, branch);
			ps1.setString(1, username);
			ps1.setString(2, password);
			ps1.setString(3, role);
			
			int count =ps.executeUpdate();
			int count1=ps1.executeUpdate();
			if(count==1 && count1==1) {
				res.sendRedirect("index.html");
			}
			else {
				pw.println("<h1>Registeration is not done</h1>");
			}
	        
			
		}catch(Exception e) {
			e.printStackTrace();
			pw.println("InvalidCredentials.html");
			//res.sendRedirect("InvalidCredentials.html");
		}
		
		

	}
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req,res);
	}
}

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

@WebServlet("/addadmin")
public class AddAdmin extends HttpServlet {
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		PrintWriter pw= res.getWriter();
		res.setContentType("text/html");
		String username=req.getParameter("username").toUpperCase();
		String password=req.getParameter("password");
		String role=req.getParameter("role");
		try {
		Class.forName("oracle.jdbc.driver.OracleDriver");
		Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
		PreparedStatement ps=con.prepareStatement("INSERT INTO USERS VALUES(?,?,?)");
		ps.setString(1, username);
		ps.setString(2, password);
		ps.setString(3, role);
		int count=ps.executeUpdate();
		if(count==1) {res.sendRedirect("setting.html");}
		else {pw.println("<h1>Admin is not added</h1>");
		}
		}catch(Exception e) {
			e.printStackTrace();
			
		}
	}
	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(req,res);
	}

}

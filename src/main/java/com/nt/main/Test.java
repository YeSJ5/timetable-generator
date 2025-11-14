package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/test")
public class Test extends HttpServlet{
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {

		res.setContentType("text/html");
		PrintWriter pw=res.getWriter();
		pw.println("<h1> HK product</h1>");

		//get username 
		String username=req.getParameter("userName").toUpperCase();
		//get password
		String password=req.getParameter("userPassword");
		pw.println(username);
		pw.println(password);
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
			PreparedStatement ps=con.prepareStatement("SELECT COUNT(*) FROM USERS WHERE USERNAME=? AND PASSWORD=?");
			ps.setString(1, username);
			ps.setString(2, password);
			ResultSet rs=ps.executeQuery();
			if(rs!=null) {
			rs.next();
			int count=rs.getInt(1);
			if(count==0) {
				res.sendRedirect("userNotFound.html");
			}
			else {
				PreparedStatement ps1=con.prepareStatement("SELECT ROLES FROM USERS WHERE USERNAME=? AND PASSWORD=?");
				ps1.setString(1, username);
				ps1.setString(2, password);
				ResultSet rs1=ps1.executeQuery();
				rs1.next();
				String role=rs1.getString(1);
				if(role.equals("admin")) {
					res.sendRedirect("/HostelManagementSystem/registration");
				}
				else if(role.equals("user")) {
					res.sendRedirect("/HostelManagementSystem/userpage");
				}
			}
			}
			
	    con.close();
		}catch(Exception e) {
			e.printStackTrace();
		}
	


	}
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req, res);
	}


}